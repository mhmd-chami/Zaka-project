import { carriers } from '@/data/carriers';
import { shopItems } from '@/data/shopItems';
import { AppLanguage } from '@/types';

const RECHARGE_QUICK_AMOUNTS = [5, 10, 15, 25];

export interface AgentAction {
  route: string;
  labelKey: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actions?: AgentAction[];
}

export interface AgentContext {
  language: AppLanguage;
  userName: string;
  balance: number;
  phone: string;
  dailySendLimit: number;
  dailyCashOutLimit: number;
  requirePinForSend: boolean;
}

type Intent =
  | 'greeting'
  | 'balance'
  | 'send'
  | 'receive'
  | 'cashOut'
  | 'addMoney'
  | 'shop'
  | 'shopItem'
  | 'history'
  | 'pin'
  | 'limits'
  | 'password'
  | 'notifications'
  | 'contact'
  | 'thanks'
  | 'fallback';

function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

const SHOP_ITEM_KEYWORDS: Record<string, string[]> = {
  s1: ['spotify', 'premium'],
  s2: ['netflix'],
  s3: ['steam'],
  s4: ['amazon', 'voucher'],
  s5: ['uber', 'ride credit'],
  s6: ['coffee shop', 'coffee card', 'coffee'],
};

function findShopItemQuery(text: string): (typeof shopItems)[number] | null {
  for (const item of shopItems) {
    const keys = SHOP_ITEM_KEYWORDS[item.id] ?? [item.brand, item.name.toLowerCase()];
    if (includesAny(text, keys)) {
      return item;
    }
  }
  return null;
}

function findCarrierQuery(text: string): (typeof carriers)[number] | null {
  for (const carrier of carriers) {
    if (includesAny(text, [carrier.id, carrier.name.toLowerCase(), carrier.brand])) {
      return carrier;
    }
  }
  return null;
}

function buildShopCatalogText(en: boolean): string {
  const rechargeLines = carriers
    .map((carrier) => {
      const quick = RECHARGE_QUICK_AMOUNTS.map((a) => `$${a}`).join(', ');
      if (en) {
        return `• ${carrier.name}: $${carrier.minAmount}–$${carrier.maxAmount} per recharge (quick amounts: ${quick})`;
      }
      return `• ${carrier.name}: $${carrier.minAmount}–$${carrier.maxAmount} لكل شحن (مبالغ سريعة: ${quick})`;
    })
    .join('\n');

  const categories = [...new Set(shopItems.map((item) => item.category))];
  const giftLines = categories
    .map((category) => {
      const items = shopItems.filter((item) => item.category === category);
      const lines = items
        .map((item) => `  – ${item.name}: $${item.price.toFixed(2)} (${item.brand})`)
        .join('\n');
      return `${category}:\n${lines}`;
    })
    .join('\n\n');

  if (en) {
    return (
      `Here's everything in the Shop tab:\n\n` +
      `Mobile recharge\n` +
      `${rechargeLines}\n` +
      `Enter any phone number, pick an amount, and tap Buy. Your redeem code is sent instantly to Notifications (bell icon). It also appears in History.\n\n` +
      `Gift cards & more\n` +
      `${giftLines}\n\n` +
      `Tap any card to buy with your wallet balance. You'll confirm the price, then the amount is deducted and the purchase shows in History.\n\n` +
      `Payment: all Shop purchases use your ZakaPay wallet balance — make sure you have enough funds first (Wallet → Add Money).`
    );
  }

  return (
    `إليك كل ما في تبويب Shop:\n\n` +
    `شحن الجوال\n` +
    `${rechargeLines}\n` +
    `أدخل رقم الهاتف، اختر المبلغ، واضغط Buy. يصل كود الاسترداد فوراً في الإشعارات (أيقونة الجرس) ويظهر أيضاً في History.\n\n` +
    `بطاقات هدايا والمزيد\n` +
    `${giftLines}\n\n` +
    `اضغط أي بطاقة للشراء من رصيد محفظتك. ستؤكد السعر، ثم يُخصم المبلغ وتظهر العملية في History.\n\n` +
    `الدفع: كل مشتريات Shop من رصيد ZakaPay — تأكد أن لديك رصيداً كافياً (Wallet → Add Money).`
  );
}

function buildShopItemText(item: (typeof shopItems)[number], en: boolean): string {
  if (en) {
    return (
      `${item.name}\n` +
      `• Category: ${item.category}\n` +
      `• Brand: ${item.brand}\n` +
      `• Price: $${item.price.toFixed(2)}\n\n` +
      `How to buy: Shop tab → Gift cards & more → tap "${item.name}" → confirm. ` +
      `The $${item.price.toFixed(2)} is deducted from your wallet and the purchase appears in History.`
    );
  }

  return (
    `${item.name}\n` +
    `• الفئة: ${item.category}\n` +
    `• العلامة: ${item.brand}\n` +
    `• السعر: $${item.price.toFixed(2)}\n\n` +
    `طريقة الشراء: Shop → Gift cards & more → اضغط "${item.name}" → أكّد. ` +
    `يُخصم $${item.price.toFixed(2)} من محفظتك وتظهر العملية في History.`
  );
}

function buildCarrierText(carrier: (typeof carriers)[number], en: boolean): string {
  const quick = RECHARGE_QUICK_AMOUNTS.map((a) => `$${a}`).join(', ');
  if (en) {
    return (
      `${carrier.name} mobile recharge\n` +
      `• Amount range: $${carrier.minAmount}–$${carrier.maxAmount}\n` +
      `• Quick pick buttons: ${quick}\n` +
      `• You can recharge any phone number (yours or someone else's)\n\n` +
      `How to buy: Shop tab → Mobile recharge → select ${carrier.name} → enter phone → enter amount → Buy ${carrier.name}. ` +
      `Your redeem code arrives in Notifications and History.`
    );
  }

  return (
    `شحن ${carrier.name}\n` +
    `• نطاق المبلغ: $${carrier.minAmount}–$${carrier.maxAmount}\n` +
    `• أزرار سريعة: ${quick}\n` +
    `• يمكنك شحن أي رقم (رقمك أو رقم شخص آخر)\n\n` +
    `طريقة الشراء: Shop → Mobile recharge → اختر ${carrier.name} → أدخل الهاتف → أدخل المبلغ → Buy ${carrier.name}. ` +
    `كود الاسترداد يصل في الإشعارات و History.`
  );
}

function detectIntent(input: string): Intent {
  const text = input.toLowerCase().trim();

  if (includesAny(text, ['hello', 'hi', 'hey', 'marhaba', 'mar7aba', 'salam', 'ahlan', 'مرحب', 'سلام', 'أهلا'])) {
    return 'greeting';
  }
  if (includesAny(text, ['thank', 'shukran', 'شكر'])) {
    return 'thanks';
  }
  if (includesAny(text, ['balance', 'money left', 'how much', 'رصيد', 'كم'])) {
    return 'balance';
  }
  if (includesAny(text, ['send', 'transfer', 'pay someone', 'ارسل', 'إرسال', 'حول'])) {
    return 'send';
  }
  if (includesAny(text, ['receive', 'qr', 'payment number', 'استلم', 'استقبال', 'رمز'])) {
    return 'receive';
  }
  if (includesAny(text, ['cash out', 'cashout', 'withdraw', 'atm', 'branch qr', 'سحب', 'نقد'])) {
    return 'cashOut';
  }
  if (includesAny(text, ['add money', 'top up', 'deposit', 'add funds', 'اضف', 'إضافة', 'شحن المحفظة'])) {
    return 'addMoney';
  }
  if (
    includesAny(text, [
      'what do you sell',
      'what is in the shop',
      "what's in the shop",
      'what in the shop',
      'everything in the shop',
      'shop catalog',
      'shop items',
      'list shop',
      'catalog',
      'products',
      'ماذا تبيع',
      'ماذا يوجد في',
      'كل ما في',
      'منتجات',
    ])
  ) {
    return 'shop';
  }
  if (
    findShopItemQuery(text) ||
    findCarrierQuery(text) ||
    includesAny(text, [
      'spotify',
      'netflix',
      'steam',
      'amazon',
      'uber',
      'coffee shop',
      'coffee card',
      'alfa',
      'touch',
      'mtn',
      'subscription',
      'voucher',
      'gift card',
      'بطاقة',
      'سبوتيفاي',
      'نتflix',
    ])
  ) {
    return 'shopItem';
  }
  if (
    includesAny(text, ['shop', 'store', 'متجر']) ||
    includesAny(text, ['recharge', 'top up phone', 'mobile credit', 'شحن', 'شحن جوال'])
  ) {
    return 'shop';
  }
  if (includesAny(text, ['history', 'transaction', 'activity', 'سجل', 'معاملات'])) {
    return 'history';
  }
  if (includesAny(text, ['pin', 'security', 'رمز pin', 'أمان'])) {
    return 'pin';
  }
  if (includesAny(text, ['limit', 'daily', 'حد', 'حدود'])) {
    return 'limits';
  }
  if (includesAny(text, ['password', 'كلمة المرور', 'كلمة السر'])) {
    return 'password';
  }
  if (includesAny(text, ['notification', 'alert', 'bell', 'إشعار'])) {
    return 'notifications';
  }
  if (includesAny(text, ['human', 'agent', 'support', 'contact', 'help me', 'دعم', 'موظف', 'اتصل'])) {
    return 'contact';
  }

  return 'fallback';
}

function reply(
  intent: Intent,
  ctx: AgentContext,
  question = ''
): Omit<AgentMessage, 'id' | 'role'> {
  const en = ctx.language === 'en';
  const q = question.toLowerCase().trim();

  switch (intent) {
    case 'greeting':
      return {
        text: en
          ? `Hi ${ctx.userName}! I'm Zaka Assistant. I can help with sends, cash outs, shop recharges, limits, and security. What do you need?`
          : `مرحباً ${ctx.userName}! أنا مساعد Zaka. أستطيع مساعدتك في الإرسال، السحب، شحن Shop، الحدود، والأمان. كيف أستطيع مساعدتك؟`,
      };
    case 'balance':
      return {
        text: en
          ? `Your current wallet balance is $${ctx.balance.toFixed(2)}. You can add money from Wallet → Add Money, or receive a transfer from another ZakaPay user.`
          : `رصيد محفظتك الحالي $${ctx.balance.toFixed(2)}. يمكنك إضافة مال من المحفظة → Add Money، أو استلام تحويل من مستخدم ZakaPay آخر.`,
        actions: [
          { route: '/add-money', labelKey: 'agentActionAddMoney' },
          { route: '/receive', labelKey: 'agentActionReceive' },
        ],
      };
    case 'send':
      return {
        text: en
          ? `To send money: open Wallet → Send, enter a phone number or scan a QR code, choose an amount, and confirm.${ctx.requirePinForSend ? ' You have PIN protection enabled, so you will be asked for your 4-digit PIN.' : ''}`
          : `لإرسال المال: افتح المحفظة → Send، أدخل رقم الهاتف أو امسح QR، اختر المبلغ، ثم أكّد.${ctx.requirePinForSend ? ' لديك حماية PIN مفعّلة، سُطلب منك PIN من 4 أرقام.' : ''}`,
        actions: [{ route: '/send', labelKey: 'agentActionSend' }],
      };
    case 'receive':
      return {
        text: en
          ? `Your ZakaPay number is ${ctx.phone}. Open Receive & QR to show your payment QR code so others can pay you instantly.`
          : `رقم ZakaPay الخاص بك ${ctx.phone}. افتح Receive & QR لعرض رمز QR حتى يتمكن الآخرون من الدفع لك فوراً.`,
        actions: [{ route: '/receive', labelKey: 'agentActionReceive' }],
      };
    case 'cashOut':
      return {
        text: en
          ? `To cash out: go to the Cash Out tab, scan the QR code at any Zaka branch (Hamra, Verdun, Tripoli, or Saida), enter the amount, and the branch admin will approve your request.`
          : `للسحب النقدي: اذهب إلى تبويب Cash Out، امسح QR في أي فرع Zaka (Hamra, Verdun, Tripoli, Saida)، أدخل المبلغ، وسيوافق مشرف الفرع على طلبك.`,
        actions: [{ route: '/(tabs)/cash-out', labelKey: 'agentActionCashOut' }],
      };
    case 'addMoney':
      return {
        text: en
          ? `Add Money lets you top up your wallet instantly for demo purposes. In production this would connect to a card or bank transfer.`
          : `Add Money يتيح شحن محفظتك فوراً لأغراض العرض. في الإنتاج سيتصل ببطاقة أو تحويل بنكي.`,
        actions: [{ route: '/add-money', labelKey: 'agentActionAddMoney' }],
      };
    case 'shop':
      return {
        text: buildShopCatalogText(en),
        actions: [
          { route: '/(tabs)/shop', labelKey: 'agentActionShop' },
          { route: '/notifications', labelKey: 'agentActionNotifications' },
        ],
      };
    case 'shopItem': {
      const item = findShopItemQuery(q);
      const carrier = findCarrierQuery(q);
      const text =
        item != null
          ? buildShopItemText(item, en)
          : carrier != null
            ? buildCarrierText(carrier, en)
            : buildShopCatalogText(en);
      return {
        text,
        actions: [
          { route: '/(tabs)/shop', labelKey: 'agentActionShop' },
          { route: '/notifications', labelKey: 'agentActionNotifications' },
        ],
      };
    }
    case 'history':
      return {
        text: en
          ? `Your full transaction history is in the History tab. You can filter sends, receives, shop purchases, and cash outs there.`
          : `سجل معاملاتك الكامل في تبويب History. يمكنك مراجعة الإرسال، الاستلام، مشتريات Shop، والسحب هناك.`,
        actions: [{ route: '/(tabs)/history', labelKey: 'agentActionHistory' }],
      };
    case 'pin':
      return {
        text: en
          ? `Set a 4-digit transaction PIN in Profile → Security → Set transaction PIN. Toggle "Require PIN to send money" for extra protection on every send.`
          : `عيّن PIN من 4 أرقام في Profile → Security → Set transaction PIN. فعّل "Require PIN to send money" لحماية إضافية عند كل إرسال.`,
        actions: [{ route: '/(tabs)/profile', labelKey: 'agentActionProfile' }],
      };
    case 'limits':
      return {
        text: en
          ? `Your daily limits: send up to $${ctx.dailySendLimit} and cash out up to $${ctx.dailyCashOutLimit} per day. Edit them anytime in Profile → Limits.`
          : `حدودك اليومية: إرسال حتى $${ctx.dailySendLimit} وسحب حتى $${ctx.dailyCashOutLimit} يومياً. عدّلها من Profile → Limits.`,
        actions: [{ route: '/(tabs)/profile', labelKey: 'agentActionProfile' }],
      };
    case 'password':
      return {
        text: en
          ? `Change your password in Profile → Security → Change password. Google-linked accounts manage passwords through Google instead.`
          : `غيّر كلمة المرور من Profile → Security → Change password. حسابات Google تُدار عبر Google.`,
        actions: [{ route: '/(tabs)/profile', labelKey: 'agentActionProfile' }],
      };
    case 'notifications':
      return {
        text: en
          ? `Notifications show shop redeem codes, cash-out approvals, and incoming transfers. Tap the bell in the top-right of any tab.`
          : `الإشعارات تعرض أكواد Shop، موافقات السحب، والتحويلات الواردة. اضغط الجرس أعلى أي تبويب.`,
        actions: [{ route: '/notifications', labelKey: 'agentActionNotifications' }],
      };
    case 'contact':
      return {
        text: en
          ? `I can handle most questions instantly. For human support: email support@zakapay.demo or call +961 1 999 000 (8am – 8pm).`
          : `أستطيع الإجابة على معظم الأسئلة فوراً. للدعم البشري: support@zakapay.demo أو +961 1 999 000 (8ص – 8م).`,
      };
    case 'thanks':
      return {
        text: en
          ? `You're welcome! I'm here anytime you need help with ZakaPay.`
          : `عفواً! أنا هنا متى احتجت مساعدة في ZakaPay.`,
      };
    default:
      return {
        text: en
          ? `I'm not sure about that yet. Try asking about your balance, sending money, cashing out, the shop, or daily limits — or tap a suggestion below.`
          : `لم أفهم ذلك بعد. جرّب السؤال عن الرصيد، الإرسال، السحب، Shop، أو الحدود — أو اضغط أحد الاقتراحات أدناه.`,
      };
  }
}

export function createMessage(
  role: AgentMessage['role'],
  text: string,
  actions?: AgentAction[]
): AgentMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    actions,
  };
}

export function getWelcomeMessage(ctx: AgentContext): AgentMessage {
  const content = reply('greeting', ctx);
  return createMessage('assistant', content.text, content.actions);
}

export function getQuickPromptKeys(): string[] {
  return [
    'agentPromptBalance',
    'agentPromptSend',
    'agentPromptCashOut',
    'agentPromptShop',
  ];
}

export async function askAgent(
  question: string,
  ctx: AgentContext
): Promise<AgentMessage> {
  const delay = 500 + Math.floor(Math.random() * 700);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const intent = detectIntent(question);
  const content = reply(intent, ctx, question);
  return createMessage('assistant', content.text, content.actions);
}

export async function buildAgentContext(): Promise<AgentContext | null> {
  const { getSession } = await import('@/services/authStorage');
  const { getProfile } = await import('@/services/walletStorage');
  const { getProfileSettings } = await import('@/services/profileSettingsStorage');

  const session = await getSession();
  if (!session) return null;

  const [profile, settings] = await Promise.all([getProfile(), getProfileSettings()]);

  return {
    language: settings?.language ?? 'en',
    userName: profile.name.split(' ')[0] || profile.name,
    balance: profile.balance,
    phone: profile.phone,
    dailySendLimit: settings?.dailySendLimit ?? 500,
    dailyCashOutLimit: settings?.dailyCashOutLimit ?? 300,
    requirePinForSend: settings?.requirePinForSend ?? false,
  };
}
