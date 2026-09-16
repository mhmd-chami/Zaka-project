import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BranchMap } from '@/components/BranchMap';
import { useSettings } from '@/contexts/SettingsContext';
import { zakaLocations } from '@/data/locations';
import { contentBottomPadding } from '@/constants/theme';
import { branchShareMessage, googleMapsUrl } from '@/utils/branchMap';
import { shareBranch } from '@/utils/shareBranch';

export default function LocationsScreen() {
  const { colors } = useSettings();
  const insets = useSafeAreaInsets();
  const [selectedId, setSelectedId] = useState(zakaLocations[0].id);
  const [mapInteraction, setMapInteraction] = useState(false);
  const [notice, setNotice] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [sharing, setSharing] = useState(false);
  const selected = zakaLocations.find((location) => location.id === selectedId) ?? zakaLocations[0];
  const { latitude, longitude } = selected.coordinate;

  function selectBranch(id: string) {
    setSelectedId(id);
    setNotice('');
    setShareLink('');
  }

  async function openMap(directions = false) {
    setNotice('');
    const url = googleMapsUrl(selected.coordinate, directions);
    try {
      await Linking.openURL(url);
    } catch {
      setNotice('Could not open Google Maps. Copy the link below into your browser.');
      setShareLink(url);
    }
  }

  async function shareLocation() {
    setNotice('');
    setShareLink('');
    setSharing(true);
    const url = googleMapsUrl(selected.coordinate);
    try {
      const result = await shareBranch(selected.name, branchShareMessage(selected.name, selected.mapArea, selected.coordinate));
      if (result === 'copied') setNotice('Location and Google Maps link copied. Paste them into a message to share.');
      if (result === 'manual') {
        setNotice('Copy this Google Maps link to share the demo location.');
        setShareLink(url);
      }
    } catch {
      setNotice('Sharing is unavailable. You can copy this Google Maps link instead.');
      setShareLink(url);
    } finally {
      setSharing(false);
    }
  }

  return (
    <ScrollView
      scrollEnabled={!mapInteraction}
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding(insets.bottom, 16) }]}
    >
      <View style={styles.headingRow}>
        <Text style={[styles.heading, { color: colors.text }]}>Find a branch</Text>
        <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}><Text style={{ color: colors.primaryLight, fontSize: 11, fontWeight: '800' }}>4 DEMO LOCATIONS</Text></View>
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Explore the map or choose a branch below.</Text>
      <View style={[styles.map, { borderColor: colors.border }]}>
        <BranchMap selectedId={selectedId} onSelect={selectBranch} onInteractionChange={setMapInteraction} />
      </View>

      <View style={[styles.selectedCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.eyebrow, { color: colors.primaryLight }]}>SELECTED LOCATION</Text>
        <Text style={[styles.selectedTitle, { color: colors.text }]}>{selected.name}</Text>
        <Text style={{ color: colors.textSecondary }}>{selected.mapArea}, Lebanon</Text>
        <Text selectable style={[styles.coordinates, { color: colors.textMuted }]}>{latitude.toFixed(4)}, {longitude.toFixed(4)}</Text>
        <Text style={[styles.demoNote, { color: colors.textSecondary }]}>Demo area pin, not a verified storefront. Maps, directions and sharing use this same point.</Text>
        <Pressable accessibilityRole="button" onPress={() => openMap()} style={[styles.primaryButton, { backgroundColor: colors.primaryDark }]}>
          <Text style={styles.primaryText}>Open in Google Maps</Text>
        </Pressable>
        <View style={styles.actionRow}>
          <Pressable accessibilityRole="button" onPress={() => openMap(true)} style={[styles.secondaryButton, { borderColor: colors.border }]}>
            <Text style={[styles.secondaryText, { color: colors.primaryLight }]}>Directions</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={sharing} onPress={shareLocation} style={[styles.secondaryButton, { borderColor: colors.border, opacity: sharing ? 0.6 : 1 }]}>
            <Text style={[styles.secondaryText, { color: colors.primaryLight }]}>{sharing ? 'Sharing…' : 'Share location'}</Text>
          </Pressable>
        </View>
        {notice ? <Text accessibilityLiveRegion="polite" style={[styles.demoNote, { color: colors.textSecondary }]}>{notice}</Text> : null}
        {shareLink ? <Text selectable style={{ color: colors.primaryLight }}>{shareLink}</Text> : null}
      </View>

      <Text style={[styles.listTitle, { color: colors.text }]}>Our demo branches</Text>
      {zakaLocations.map((location, index) => {
        const active = selectedId === location.id;
        return (
          <Pressable
            key={location.id}
            accessibilityRole="button"
            accessibilityLabel={`Select ${location.name}`}
            accessibilityState={{ selected: active }}
            onPress={() => selectBranch(location.id)}
            style={[styles.branch, { backgroundColor: active ? colors.primarySoft : colors.surface, borderColor: active ? colors.primaryLight : colors.border }]}
          >
            <View style={[styles.branchNumber, { backgroundColor: active ? colors.primaryDark : colors.surfaceSoft }]}><Text style={{ color: active ? '#fff' : colors.textSecondary, fontWeight: '800' }}>{index + 1}</Text></View>
            <View style={styles.branchDetails}>
              <Text style={[styles.title, { color: colors.text }]}>{location.name}</Text>
              <Text style={{ color: colors.textSecondary }}>{location.mapArea}</Text>
              <Text style={[styles.hours, { color: colors.textMuted }]}>Demo hours · {location.hours}</Text>
            </View>
            {active ? <Text style={{ color: colors.primaryLight, fontSize: 12, fontWeight: '700' }}>Selected</Text> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  heading: { fontSize: 24, fontWeight: '800' },
  badge: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  map: { height: 360, borderRadius: 18, overflow: 'hidden', borderWidth: 1 },
  selectedCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 9 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  selectedTitle: { fontSize: 21, fontWeight: '800' },
  coordinates: { fontSize: 12 },
  demoNote: { fontSize: 12, lineHeight: 18 },
  primaryButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  actionRow: { flexDirection: 'row', gap: 10 },
  secondaryButton: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 10 },
  secondaryText: { fontWeight: '700', fontSize: 13 },
  listTitle: { fontSize: 17, fontWeight: '800', marginTop: 8 },
  branch: { padding: 14, gap: 12, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  branchNumber: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  branchDetails: { flex: 1, gap: 4 },
  title: { fontSize: 15, fontWeight: '700' },
  hours: { fontSize: 12 },
});
