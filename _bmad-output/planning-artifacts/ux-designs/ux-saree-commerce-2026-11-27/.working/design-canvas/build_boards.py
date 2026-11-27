"""Builds the second batch of Alar design-canvas boards (shopper flow + admin web)."""
import json, os

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'project')
P, PD, T1, T2, T3, T4 = '#6F52F0', '#5B3FD6', '#EDE8FF', '#DCD3FF', '#BFB1FF', '#F6F3FF'
INK, MUTE, LINE, PAGE, GROUND = '#1B1530', '#6B6680', '#E7E3F5', '#FBFAFF', '#F3F3F6'
GREEN, AMBER, RED = '#14694A', '#B25B00', '#B3261E'
HF = "font-family: 'Plus Jakarta Sans', Inter, sans-serif"
BODY = 'font-family: Inter, system-ui, sans-serif'
GLASS = 'background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(20px) saturate(1.6); -webkit-backdrop-filter: blur(20px) saturate(1.6)'
B = dict(maroon='a94ad61cf865be10bcb7061ca145725e', violet='809dd3ab7d8a153d658ee47b06aa9f6d',
         emerald='9b3cc9c6bbc1978de5bf240effbf0100', peacock='74590865037709df112ad30b8ff6f639',
         ivory='a751f2bab3aba40c155d95441a4aa3db', mustard='f70170e183596b45a20bb2429c7a0a82',
         rust='0cc49d60c71336cfa33ceb1a7d43b13d', navy='fc61589003f098c607a7b83fbb429b16',
         shirt='b8ee5894f1bd921064727bed753a3721', tryon='f27e858bff1d356e52141688fca8ed30',
         wedding='1b033773fe51d86b400c678d4b0b2f74', pongal='d65cb4b14f83f67ef2f7fc4e0ed0bb8e',
         cottons='8552f8e774cdf563acd71998ee719775', c_sarees='f806df5675b47d18200679f3d4a59029')

ICON = dict(
    back='<path d="M20 12H5M11 5l-7 7 7 7"/>', close='<path d="M6 6l12 12M18 6L6 18"/>',
    right='<path d="M9 5l7 7-7 7"/>', check='<path d="M5 12.500l4.500 4.500L19 7.500"/>',
    spark='<path d="M12 3l1.800 4.700L18.500 9.500l-4.700 1.800L12 16l-1.800-4.700L5.500 9.500l4.700-1.800z"/>',
    bag='<path d="M6 8h12l-1 11a1 1 0 01-1 1H8a1 1 0 01-1-1z"/><path d="M9 8V7a3 3 0 016 0v1"/>',
    pin='<path d="M12 21s7-6.200 7-11a7 7 0 10-14 0c0 4.800 7 11 7 11z"/><circle cx="12" cy="10" r="2.500"/>',
    phone='<rect x="7" y="2.500" width="10" height="19" rx="2.500"/><path d="M11 18h2"/>',
    lock='<rect x="5" y="10.500" width="14" height="10" rx="2.500"/><path d="M8 10.500V8a4 4 0 018 0v2.500"/>',
    camera='<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.500"/><path d="M8 6l1.500-2h5L16 6"/>',
    image='<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.800"/><path d="M4 18l5.500-5 4 3.500 3-2.500 3.500 3"/>',
    share='<path d="M12 15V4M8 7.500L12 4l4 3.500M5 13v5a2 2 0 002 2h10a2 2 0 002-2v-5"/>',
    download='<path d="M12 4v11M8 11.500l4 3.500 4-3.500M5 20h14"/>',
    flag='<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', trash='<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13"/>',
    truck='<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7.500" cy="17.500" r="1.800"/><circle cx="17.500" cy="17.500" r="1.800"/>',
    tag='<path d="M4 4h8l8 8-8 8-8-8z"/><circle cx="8.500" cy="8.500" r="1.200"/>',
    plus='<path d="M12 5v14M5 12h14"/>', minus='<path d="M5 12h14"/>',
    search='<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.500-3.500"/>',
    home='<path d="M4 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z"/>',
    box='<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    users='<circle cx="9" cy="9" r="3.500"/><path d="M2.500 20a6.500 6.500 0 0113 0M16 5.500a3.500 3.500 0 010 7M18 14.500a6 6 0 013.500 5.500"/>',
    chart='<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    layout='<rect x="3" y="4" width="18" height="16" rx="2.500"/><path d="M3 9h18M9 9v11"/>',
    gear='<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.600 5.600l2.100 2.100M16.300 16.300l2.100 2.100M5.600 18.400l2.100-2.100M16.300 7.700l2.100-2.100"/>',
    receipt='<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    shield='<path d="M12 3l7 3v5c0 5-3.500 8-7 10-3.500-2-7-5-7-10V6z"/>',
    undo='<path d="M4 9h10a5 5 0 010 10H8M4 9l4-4M4 9l4 4"/>',
    help='<circle cx="12" cy="12" r="9"/><path d="M9.500 9.500a2.500 2.500 0 114 2c-.900.700-1.500 1.200-1.500 2.500M12 17.500v.100"/>',
    drag='<path d="M9 6v.100M15 6v.100M9 12v.100M15 12v.100M9 18v.100M15 18v.100"/>',
    eye='<path d="M2 12s3.600-7 10-7 10 7 10 7-3.600 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    filter='<path d="M4 6h16M7 12h10M10 18h4"/>', bell='<path d="M6 16V11a6 6 0 0112 0v5l1.500 2h-15zM10 20h4"/>',
    mail='<rect x="3" y="5" width="18" height="14" rx="2.500"/><path d="M4 7l8 6 8-6"/>',
    heart='<path d="M12 20s-7.500-4.600-7.500-10A4.300 4.300 0 0112 7.300 4.300 4.300 0 0119.500 10c0 5.400-7.500 10-7.500 10z"/>',
)


def ic(n, s=20, w=2, c='currentColor'):
    return f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0">{ICON[n]}</svg>'


def img(k, pos='center top', alt=''):
    return f'<img src="/_blob/{B[k]}" alt="{alt}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: {pos}; display: block">'


def pic(k, w, h, r=10, pos='center top'):
    return f'<span style="width: {w}px; height: {h}px; border-radius: {r}px; overflow: hidden; position: relative; flex-shrink: 0; background: {GROUND}; display: block">{img(k, pos)}</span>'


def page(title, w, h, inner):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap">
<style>
body{{margin:0}}
a{{color:{P}}}a:hover{{color:{PD}}}
</style>
</helmet>
{inner}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
class Component extends DCLogic {{
renderVals() {{
return {{}};
}}
}}
</script>
</body>
</html>
'''


def phone(h, inner, bg='#FFFFFF'):
    return f'<div style="width: 390px; height: {h}px; box-sizing: border-box; position: relative; overflow: hidden; background: {bg}; color: {INK}; {BODY}; display: flex; flex-direction: column">{inner}</div>'


def hdr(title, back='Main.dc.html', right='', sub=''):
    subl = f'<span style="font-size: 12px; line-height: 16px; color: {MUTE}">{sub}</span>' if sub else ''
    return f'''<header style="height: 56px; box-sizing: border-box; padding: 0 12px 0 4px; display: flex; align-items: center; gap: 4px; flex-shrink: 0; background: #FFFFFF; border-bottom: 1px solid {LINE}">
  <a href="{back}" aria-label="Back" style="width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; color: {INK}; text-decoration: none">{ic('back', 24)}</a>
  <div style="flex: 1; min-width: 0; display: flex; flex-direction: column"><span style="{HF}; font-size: 16px; line-height: 22px; font-weight: 700">{title}</span>{subl}</div>{right}
</header>'''


def btn(t, kind='primary', href='#', icon='', h=40, extra=''):
    st = {'primary': f'background: {P}; color: #FFFFFF; border: 0',
          'outline': f'background: #FFFFFF; color: {PD}; border: 1.500px solid {P}',
          'ghost': f'background: #FFFFFF; color: {INK}; border: 1px solid {T2}',
          'dark': f'background: {INK}; color: #FFFFFF; border: 0'}[kind]
    i = ic(icon, 18) if icon else ''
    return f'<a href="{href}" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: {h}px; padding: 0 16px; box-sizing: border-box; border-radius: 8px; {st}; font-size: 14px; font-weight: 700; text-decoration: none; {extra}">{i}{t}</a>'


def bar(inner, cols=2):
    return f'<div style="position: absolute; left: 0; right: 0; bottom: 0; box-sizing: border-box; padding: 8px 16px 12px; display: grid; grid-template-columns: {cols}; gap: 8px; align-items: center; {GLASS}; border-top: 1px solid rgba(231, 227, 245, 0.95)">{inner}</div>'


def field(label, value='', ph='', pre='', w='100%', hint=''):
    v = f'<span style="color: {INK}">{value}</span>' if value else f'<span style="color: #9B97AD">{ph}</span>'
    p = f'<span style="font-weight: 600; padding-right: 10px; margin-right: 10px; border-right: 1px solid {T2}">{pre}</span>' if pre else ''
    hi = f'<span style="font-size: 12px; line-height: 16px; color: {MUTE}">{hint}</span>' if hint else ''
    return f'<label style="display: flex; flex-direction: column; gap: 6px; width: {w}"><span style="font-size: 13px; line-height: 18px; font-weight: 600">{label}</span><span style="display: flex; align-items: center; height: 44px; box-sizing: border-box; padding: 0 12px; border-radius: 8px; border: 1px solid {T2}; background: #FFFFFF; font-size: 14px">{p}{v}</span>{hi}</label>'


def chip(t, on=False, tone=None):
    if tone:
        fg, bg = {'green': (GREEN, '#E3F4EC'), 'amber': (AMBER, '#FFF1DC'), 'red': (RED, '#FCE8E6'), 'lav': (PD, T1), 'grey': (MUTE, '#F1F0F5')}[tone]
        return f'<span style="display: inline-flex; align-items: center; height: 22px; padding: 0 8px; border-radius: 6px; background: {bg}; color: {fg}; font-size: 11px; font-weight: 700; white-space: nowrap">{t}</span>'
    st = f'background: {INK}; color: #FFFFFF' if on else f'background: #FFFFFF; border: 1px solid {T2}; color: {INK}'
    return f'<span style="height: 32px; padding: 0 12px; box-sizing: border-box; border-radius: 999px; display: inline-flex; align-items: center; font-size: 13px; font-weight: 600; flex-shrink: 0; {st}">{t}</span>'


def row(l, r, bold=False, color=INK):
    fw = '700' if bold else '400'
    return f'<div style="display: flex; justify-content: space-between; font-size: 14px; line-height: 20px; font-weight: {fw}"><span>{l}</span><span style="color: {color}">{r}</span></div>'


def card(inner, pad=16, gap=12, extra=''):
    return f'<div style="background: #FFFFFF; border: 1px solid {LINE}; border-radius: 16px; padding: {pad}px; display: flex; flex-direction: column; gap: {gap}px; {extra}">{inner}</div>'


def h2(t, size=16):
    return f'<h2 style="margin: 0; {HF}; font-size: {size}px; line-height: {size + 6}px; font-weight: 700">{t}</h2>'


def logo(s=22):
    return f'<span style="{HF}; font-size: {s}px; font-weight: 800; letter-spacing: -0.03em; color: {P}">alar</span>'


def toggle(on=True):
    j, bg = ('flex-end', P) if on else ('flex-start', '#CFCBDD')
    return f'<span style="width: 36px; height: 20px; border-radius: 999px; background: {bg}; display: inline-flex; align-items: center; justify-content: {j}; padding: 2px; box-sizing: border-box; flex-shrink: 0"><span style="width: 16px; height: 16px; border-radius: 999px; background: #FFFFFF"></span></span>'


boards = {}

# ------------------------------------------------------------------ Onboarding
boards['Onboarding'] = ('Alar onboarding', 390, 844, phone(844, f'''
  <div style="height: 500px; position: relative; flex-shrink: 0; background: {GROUND}">{img('tryon', '78% center', 'Mockup image of a shopper taking a photo for try-on')}
    <a href="Login.dc.html" style="position: absolute; right: 16px; top: 16px; height: 32px; padding: 0 12px; border-radius: 999px; background: #FFFFFF; border: 1px solid {LINE}; color: {INK}; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; text-decoration: none">Skip</a>
  </div>
  <div style="flex: 1; padding: 20px 16px 20px; display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 6px"><span style="width: 6px; height: 6px; border-radius: 999px; background: {T2}"></span><span style="width: 20px; height: 6px; border-radius: 999px; background: {P}"></span><span style="width: 6px; height: 6px; border-radius: 999px; background: {T2}"></span></div>
    <h1 style="margin: 0; {HF}; font-size: 24px; line-height: 30px; font-weight: 800; letter-spacing: -0.02em">See it on you before you buy</h1>
    <p style="margin: 0; font-size: 14px; line-height: 22px; color: {MUTE}">Upload one photo and see any saree on you. Then open the full saree and zoom into every thread.</p>
    <div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px">
      {btn('Next', href='Login.dc.html')}
      <a href="Login.dc.html" style="display: inline-flex; align-items: center; justify-content: center; height: 40px; font-size: 14px; font-weight: 600; color: {MUTE}; text-decoration: none">I already have an account</a>
    </div>
  </div>'''))

# ------------------------------------------------------------------ Login
GOOGLE = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22 12.200c0-.700-.100-1.400-.200-2H12v3.900h5.600a4.800 4.800 0 01-2.100 3.100v2.600h3.400c2-1.800 3.100-4.500 3.100-7.600z"/><path fill="#34A853" d="M12 22c2.800 0 5.200-.900 6.900-2.500l-3.400-2.600c-.900.600-2.100 1-3.500 1a6.100 6.100 0 01-5.700-4.200H2.800v2.700A10.400 10.400 0 0012 22z"/><path fill="#FBBC05" d="M6.300 13.700a6.200 6.200 0 010-3.900V7.100H2.800a10.400 10.400 0 000 9.300z"/><path fill="#EA4335" d="M12 5.700c1.500 0 2.900.500 4 1.600l3-3A10.400 10.400 0 002.800 7.100l3.500 2.700A6.100 6.100 0 0112 5.700z"/></svg>'
boards['Login'] = ('Alar login', 390, 844, phone(844, f'''
  <div style="height: 196px; position: relative; flex-shrink: 0; background: linear-gradient(180deg, {T1} 0%, {T4} 70%, #FFFFFF 100%); padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between">
    <a href="Onboarding.dc.html" aria-label="Close" style="width: 40px; height: 40px; border-radius: 999px; background: #FFFFFF; border: 1px solid {LINE}; display: inline-flex; align-items: center; justify-content: center; color: {INK}">{ic('close', 18, 2.200)}</a>
    <div style="display: flex; flex-direction: column; gap: 4px">{logo(28)}
      <h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800; letter-spacing: -0.01em">Log in or sign up</h1></div>
  </div>
  <div style="padding: 20px 16px 0; display: flex; flex-direction: column; gap: 16px">
    {field('Mobile number', '98400 12345', pre='+91', hint='We will send a 6-digit code by SMS to check it is you.')}
    {btn('Get OTP', href='Otp.dc.html')}
    <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: {MUTE}"><span style="flex: 1; height: 1px; background: {LINE}"></span>or<span style="flex: 1; height: 1px; background: {LINE}"></span></div>
    <a href="Otp.dc.html" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 40px; border-radius: 8px; background: #FFFFFF; border: 1px solid {T2}; color: {INK}; font-size: 14px; font-weight: 600; text-decoration: none">{GOOGLE}Continue with Google</a>
    <div style="display: flex; gap: 10px; padding: 12px; border-radius: 10px; background: {T4}; color: {MUTE}; font-size: 12px; line-height: 18px">{ic('shield', 18, 2, P)}<span>With Google we take your name and email, then confirm your mobile number with an OTP. Orders and delivery updates need a mobile number.</span></div>
  </div>
  <p style="margin: auto 16px 20px; font-size: 12px; line-height: 18px; color: {MUTE}; text-align: center">By continuing you agree to the <a href="#terms" style="font-weight: 600; text-decoration: none">Terms of Use</a> and <a href="#privacy" style="font-weight: 600; text-decoration: none">Privacy Policy</a>.</p>'''))

# ------------------------------------------------------------------ OTP
def otpbox(d, on=False):
    bd = f'2px solid {P}' if on else f'1px solid {T2}'
    return f'<span style="width: 48px; height: 52px; border-radius: 10px; border: {bd}; box-sizing: border-box; background: #FFFFFF; display: inline-flex; align-items: center; justify-content: center; {HF}; font-size: 20px; font-weight: 700">{d}</span>'


boards['Otp'] = ('Alar OTP', 390, 844, phone(844, f'''
  <header style="height: 56px; padding: 0 4px; display: flex; align-items: center; flex-shrink: 0"><a href="Login.dc.html" aria-label="Back" style="width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; color: {INK}">{ic('back', 24)}</a></header>
  <div style="padding: 8px 16px 0; display: flex; flex-direction: column; gap: 20px">
    <span style="width: 52px; height: 52px; border-radius: 16px; background: {T1}; color: {P}; display: inline-flex; align-items: center; justify-content: center">{ic('phone', 26, 1.800)}</span>
    <div style="display: flex; flex-direction: column; gap: 6px">
      <h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800; letter-spacing: -0.01em">Enter the code</h1>
      <p style="margin: 0; font-size: 14px; line-height: 22px; color: {MUTE}">Sent by SMS to <strong style="color: {INK}; font-weight: 600">+91 98400 12345</strong> <a href="Login.dc.html" style="font-weight: 600; text-decoration: none">Change</a></p>
    </div>
    <div style="display: flex; justify-content: space-between">{otpbox('4')}{otpbox('8')}{otpbox('1')}{otpbox('', True)}{otpbox('')}{otpbox('')}</div>
    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: {MUTE}"><span>Code not received?</span><span style="font-weight: 600">Send again in 0:24</span></div>
    {btn('Verify and continue', href='SignUp.dc.html')}
    <div style="display: flex; gap: 10px; align-items: center; font-size: 12px; line-height: 18px; color: {MUTE}">{ic('lock', 16, 2, MUTE)}<span>The code works for 5 minutes. Never share it with anyone, including Alar staff.</span></div>
  </div>'''))

# ------------------------------------------------------------------ Sign up
boards['SignUp'] = ('Alar sign up', 390, 844, phone(844, f'''
  <header style="height: 56px; padding: 0 16px 0 4px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0"><a href="Otp.dc.html" aria-label="Back" style="width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; color: {INK}">{ic('back', 24)}</a><span style="font-size: 13px; font-weight: 600; color: {MUTE}">New account</span></header>
  <div style="padding: 8px 16px 0; display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; flex-direction: column; gap: 6px">
      <h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800; letter-spacing: -0.01em">Tell us a little about you</h1>
      <p style="margin: 0; font-size: 14px; line-height: 22px; color: {MUTE}">Only your name is needed. You can add the rest later.</p>
    </div>
    <div style="display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border-radius: 8px; background: #E3F4EC; color: {GREEN}; font-size: 13px; font-weight: 600">{ic('check', 16, 2.600)}+91 98400 12345 verified</div>
    {field('Full name', 'Lakshmi Narayanan')}
    {field('Email (optional)', ph='name@example.com', hint='For invoices and order emails.')}
    {field('Delivery PIN code (optional)', '600028', hint='Shows delivery dates while you browse.')}
    <div style="display: flex; flex-direction: column; gap: 4px">
      <label style="display: flex; align-items: center; gap: 12px; min-height: 40px; font-size: 14px; line-height: 20px"><input type="checkbox" checked style="width: 20px; height: 20px; accent-color: {P}; margin: 0; flex-shrink: 0">Send order updates on WhatsApp</label>
      <label style="display: flex; align-items: center; gap: 12px; min-height: 40px; font-size: 14px; line-height: 20px"><input type="checkbox" style="width: 20px; height: 20px; accent-color: {P}; margin: 0; flex-shrink: 0">Tell me about new arrivals and offers</label>
    </div>
  </div>
  <div style="margin-top: auto; padding: 12px 16px 20px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid {LINE}">{btn('Create account', href='Main.dc.html')}</div>'''))

# ------------------------------------------------------------------ Try-on photo
def tip(t, ok=True):
    c, bg, i = (GREEN, '#E3F4EC', 'check') if ok else (RED, '#FCE8E6', 'close')
    return f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; line-height: 18px"><span style="width: 18px; height: 18px; border-radius: 999px; background: {bg}; color: {c}; display: inline-flex; align-items: center; justify-content: center">{ic(i, 12, 3)}</span>{t}</span>'


boards['TryOnPhoto'] = ('Alar try-on photo', 390, 844, phone(844, hdr('Choose your photo', 'Consent.dc.html', f'<span style="font-size: 13px; font-weight: 600; color: {MUTE}">Step 2 of 2</span>') + f'''
  <div style="padding: 16px 16px 0; display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; gap: 12px">
      <div style="width: 196px; height: 262px; border-radius: 16px; overflow: hidden; position: relative; flex-shrink: 0; background: {GROUND}; border: 2px solid {P}; box-sizing: border-box">{img('tryon', '80% center', 'Mockup of the photo the shopper chose')}
        <span style="position: absolute; left: 8px; top: 8px; height: 24px; padding: 0 8px; border-radius: 6px; background: #FFFFFF; border: 1px solid {LINE}; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; color: {GREEN}">{ic('check', 12, 3)}Looks good</span>
      </div>
      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 10px; padding-top: 4px">
        <strong style="font-size: 13px; font-weight: 700">Best results</strong>
        {tip('Full length, head to feet')}{tip('Facing the camera')}{tip('Bright, even light')}{tip('Just you in the photo')}
        <strong style="font-size: 13px; font-weight: 700; margin-top: 4px">Avoid</strong>
        {tip('Sitting or cropped', False)}{tip('Other people', False)}
      </div>
    </div>
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{btn('Gallery', 'ghost', icon='image')}{btn('Camera', 'ghost', icon='camera')}</div>
    {card(f"""<div style="display: flex; gap: 12px; align-items: center">{pic('maroon', 48, 60, 8)}<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; color: {MUTE}">Trying on</span><strong style="font-size: 14px; line-height: 20px; font-weight: 700">Arani silk saree, maroon</strong></span><a href="Listing.dc.html" style="font-size: 13px; font-weight: 600; text-decoration: none">Change</a></div>""", 12)}
    <div style="display: flex; gap: 10px; font-size: 12px; line-height: 18px; color: {MUTE}">{ic('lock', 16, 2, MUTE)}<span>Your photo is used only to make this picture. You can delete it any time from Try-on &gt; My photos.</span></div>
  </div>''' + bar(btn('Create my try-on', href='TryOnResult.dc.html', icon='spark'), '1fr')))

# ------------------------------------------------------------------ Try-on result
def act(i, t):
    return f'<a href="#{t}" style="flex: 1; height: 44px; border-radius: 10px; border: 1px solid {T2}; background: #FFFFFF; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; color: {INK}; font-size: 11px; font-weight: 600; text-decoration: none">{ic(i, 18, 1.800)}{t}</a>'


boards['TryOnResult'] = ('Alar try-on result', 390, 980, phone(980, hdr('Your try-on', 'Product.dc.html', f'<a href="#photos" style="font-size: 13px; font-weight: 600; text-decoration: none">My photos</a>') + f'''
  <div style="height: 470px; position: relative; flex-shrink: 0; background: {GROUND}">{img('maroon', 'center top', 'Mockup of the try-on result: the shopper wearing the maroon saree')}
    <span style="position: absolute; left: 0; top: 14px; height: 24px; padding: 0 10px 0 8px; display: inline-flex; align-items: center; gap: 4px; background: {P}; color: #FFFFFF; font-size: 11px; font-weight: 700; border-radius: 0 6px 6px 0">{ic('spark', 12, 2.400)}AI PREVIEW</span>
    <span style="position: absolute; right: 12px; bottom: 12px; height: 28px; padding: 0 10px; border-radius: 8px; background: #FFFFFF; border: 1px solid {LINE}; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center">Hold to compare</span>
  </div>
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 10px; padding: 10px 12px; border-radius: 10px; background: {T4}; font-size: 12px; line-height: 18px; color: {MUTE}">{ic('spark', 16, 2, P)}<span>This picture is made by AI. The real drape, colour and fall can look different. See the product photos for the true saree.</span></div>
    <div style="display: flex; gap: 8px">{act('download', 'Save')}{act('share', 'Share')}{act('flag', 'Report')}{act('trash', 'Delete')}</div>
    <div style="display: flex; align-items: center; justify-content: space-between"><div style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 14px; line-height: 20px"><strong style="font-weight: 700">Arani silk saree</strong> Maroon</span><span style="{HF}; font-size: 16px; font-weight: 800">₹3,150 <span style="font-family: Inter, sans-serif; font-size: 12px; font-weight: 400; color: {MUTE}; text-decoration: line-through">₹3,600</span></span></div><span style="font-size: 12px; color: {MUTE}">2 of 5 free try-ons today</span></div>
    <div style="display: flex; flex-direction: column; gap: 8px">
      <strong style="font-size: 14px; font-weight: 700">Try another on the same photo</strong>
      <div style="display: flex; gap: 8px">{pic('violet', 64, 80)}{pic('emerald', 64, 80)}{pic('peacock', 64, 80)}{pic('mustard', 64, 80)}{pic('navy', 64, 80)}</div>
    </div>
  </div>''' + bar(btn('Wishlist', 'outline', icon='heart') + btn('Add to bag', href='Bag.dc.html', icon='bag'), 'repeat(2, minmax(0, 1fr))')))

# ------------------------------------------------------------------ Bag
def stepper(n):
    b = f'width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; color: {INK}'
    return f'<span style="display: inline-flex; align-items: center; height: 28px; border: 1px solid {T2}; border-radius: 8px"><span style="{b}">{ic("minus", 14, 2.400)}</span><span style="width: 24px; text-align: center; font-size: 13px; font-weight: 700">{n}</span><span style="{b}">{ic("plus", 14, 2.400)}</span></span>'


def bagitem(k, name, var, price, mrp, off, note, qty=1):
    return f'''<div style="display: flex; gap: 12px; padding: 12px 16px; background: #FFFFFF; border-bottom: 1px solid {LINE}">{pic(k, 84, 105)}
      <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px">
        <div style="display: flex; justify-content: space-between; gap: 8px"><strong style="font-size: 14px; line-height: 20px; font-weight: 700">{name}</strong><span style="color: {MUTE}">{ic('close', 16, 2.200)}</span></div>
        <span style="font-size: 12px; line-height: 16px; color: {MUTE}">{var}</span>
        <div style="display: flex; align-items: center; gap: 6px"><span style="{HF}; font-size: 15px; font-weight: 800">{price}</span><span style="font-size: 12px; color: {MUTE}; text-decoration: line-through">{mrp}</span><span style="font-size: 12px; font-weight: 700; color: {PD}">{off}</span></div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 2px">{stepper(qty)}<span style="font-size: 12px; font-weight: 600; color: {AMBER}">{note}</span></div>
        <span style="font-size: 12px; color: {MUTE}">7 days easy return</span>
      </div></div>'''


boards['Bag'] = ('Alar bag', 390, 1010, phone(1010, hdr('Bag', 'Main.dc.html', f'<span style="font-size: 13px; color: {MUTE}">2 items</span>') + f'''
  <div style="display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: {T4}; font-size: 13px; line-height: 18px">{ic('pin', 16, 2, P)}<span style="flex: 1; min-width: 0">Deliver to <strong style="font-weight: 700">Lakshmi, 600028</strong></span><a href="Checkout.dc.html" style="font-weight: 600; text-decoration: none">Change</a></div>
  {bagitem('maroon', 'Arani silk saree', 'Maroon · With blouse piece', '₹3,150', '₹3,600', '12% OFF', 'Only 3 left')}
  {bagitem('ivory', 'Kasavu cotton saree', 'Ivory · With blouse piece', '₹1,800', '₹2,000', '10% OFF', '', 1)}
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    <a href="#coupon" style="display: flex; align-items: center; gap: 10px; height: 44px; padding: 0 12px; border-radius: 10px; border: 1px dashed {T3}; background: {T4}; color: {INK}; font-size: 14px; font-weight: 600; text-decoration: none">{ic('tag', 18, 2, P)}<span style="flex: 1">Apply coupon</span>{ic('right', 16, 2.200, MUTE)}</a>
    {card(h2('Price details', 14) + row('Total MRP (2 items)', '₹5,600') + row('Discount on MRP', '− ₹650', color=GREEN) + row('Delivery', 'FREE', color=GREEN) + f'<span style="height: 1px; background: {LINE}"></span>' + row('Total amount', '₹4,950', True) + f'<span style="font-size: 12px; line-height: 16px; color: {MUTE}">Prices include all taxes.</span>')}
    <div style="display: flex; gap: 10px; align-items: center; font-size: 12px; line-height: 18px; color: {MUTE}">{ic('lock', 16, 2, MUTE)}<span>Pay online by UPI, card or net banking. Cash on delivery is coming later.</span></div>
  </div>''' + bar(f'<span style="display: flex; flex-direction: column"><span style="{HF}; font-size: 16px; font-weight: 800">₹4,950</span><span style="font-size: 12px; color: {GREEN}; font-weight: 600">You save ₹650</span></span>' + btn('Place order', href='Checkout.dc.html'), 'minmax(0, 1fr) 180px')))

# ------------------------------------------------------------------ Checkout
def stepdot(n, t, state):
    bg, fg = {'done': (P, '#FFFFFF'), 'on': (INK, '#FFFFFF'), 'todo': ('#FFFFFF', MUTE)}[state]
    bd = f'border: 1px solid {T2};' if state == 'todo' else ''
    inner = ic('check', 12, 3) if state == 'done' else str(n)
    return f'<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: {INK if state != "todo" else MUTE}"><span style="width: 20px; height: 20px; border-radius: 999px; background: {bg}; color: {fg}; {bd} box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700">{inner}</span>{t}</span>'


def radio(on):
    return f'<span style="width: 18px; height: 18px; border-radius: 999px; border: 2px solid {P if on else "#B9B4CC"}; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0">{f"<span style=\'width: 8px; height: 8px; border-radius: 999px; background: {P}\'></span>" if on else ""}</span>'


def paym(t, s, on=False):
    bd = f'1.500px solid {P}' if on else f'1px solid {LINE}'
    return f'<div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: {bd}; background: {T4 if on else "#FFFFFF"}">{radio(on)}<span style="flex: 1; display: flex; flex-direction: column"><strong style="font-size: 14px; line-height: 20px; font-weight: 600">{t}</strong><span style="font-size: 12px; line-height: 16px; color: {MUTE}">{s}</span></span></div>'


LINE_SEP = f'<span style="flex: 1; height: 1px; background: {T2}"></span>'
boards['Checkout'] = ('Alar checkout', 390, 1010, phone(1010, hdr('Checkout', 'Bag.dc.html', f'<span style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: {GREEN}">{ic("lock", 14, 2.200)}Secure</span>') + f'''
  <div style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: #FFFFFF; border-bottom: 1px solid {LINE}">{stepdot(1, 'Bag', 'done')}{LINE_SEP}{stepdot(2, 'Address', 'done')}{LINE_SEP}{stepdot(3, 'Payment', 'on')}</div>
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {card(f"""<div style="display: flex; justify-content: space-between; align-items: center">{h2('Deliver to', 14)}<a href="#address" style="font-size: 13px; font-weight: 600; text-decoration: none">Change</a></div>
      <div style="display: flex; flex-direction: column; gap: 2px; font-size: 13px; line-height: 20px"><span><strong style="font-weight: 700">Lakshmi Narayanan</strong> {chip('HOME', tone='lav')}</span><span style="color: {MUTE}">14, 2nd Cross Street, Mandaveli, Chennai, Tamil Nadu 600028</span><span style="color: {MUTE}">+91 98400 12345</span></div>
      <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600">{ic('truck', 16, 2, P)}Arrives by Tue, 1 Dec · Free delivery</div>""", 12, 10)}
    {card(f"""<div style="display: flex; align-items: center; gap: 8px">{pic('maroon', 40, 50, 8)}{pic('ivory', 40, 50, 8)}<span style="flex: 1; font-size: 13px; color: {MUTE}; padding-left: 4px">2 items</span><strong style="{HF}; font-size: 15px; font-weight: 800">₹4,950</strong></div>""", 12)}
    <div style="display: flex; flex-direction: column; gap: 8px">{h2('Pay with', 14)}
      {paym('UPI', 'Google Pay, PhonePe, Paytm or any UPI app', True)}{paym('Credit or debit card', 'Visa, Mastercard, RuPay')}{paym('Net banking', 'All major banks')}
      <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: 1px solid {LINE}; background: #F6F5FA; color: {MUTE}">{radio(False)}<span style="flex: 1; display: flex; flex-direction: column"><strong style="font-size: 14px; line-height: 20px; font-weight: 600">Cash on delivery</strong><span style="font-size: 12px; line-height: 16px">Not available yet</span></span></div>
    </div>
    {card(row('Total MRP', '₹5,600') + row('Discount', '− ₹650', color=GREEN) + row('Delivery', 'FREE', color=GREEN) + f'<span style="height: 1px; background: {LINE}"></span>' + row('To pay', '₹4,950', True), 12, 8)}
    <span style="font-size: 12px; line-height: 18px; color: {MUTE}">Payments are handled by Razorpay. We hold your items for 15 minutes while you pay.</span>
  </div>''' + bar(btn('Pay ₹4,950', href='OrderPlaced.dc.html', icon='lock'), '1fr')))

# ------------------------------------------------------------------ Order placed
boards['OrderPlaced'] = ('Alar order confirmed', 390, 844, phone(844, f'''
  <div style="padding: 56px 16px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center">
    <span style="width: 64px; height: 64px; border-radius: 999px; background: {T1}; display: inline-flex; align-items: center; justify-content: center"><span style="width: 44px; height: 44px; border-radius: 999px; background: {P}; color: #FFFFFF; display: inline-flex; align-items: center; justify-content: center">{ic('check', 24, 3)}</span></span>
    <h1 style="margin: 0; {HF}; font-size: 22px; line-height: 28px; font-weight: 800; letter-spacing: -0.01em">Order confirmed</h1>
    <p style="margin: 0; font-size: 14px; line-height: 22px; color: {MUTE}">Thank you, Lakshmi. We have received ₹4,950 and are packing your sarees.</p>
  </div>
  <div style="padding: 24px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {card(row('Order number', '<strong style="font-weight: 700">AL-2611-00418</strong>') + row('Paid by', 'UPI') + row('Arrives by', '<strong style="font-weight: 700">Tue, 1 Dec</strong>') + f'<span style="height: 1px; background: {LINE}"></span><div style="display: flex; align-items: center; gap: 8px">{pic("maroon", 48, 60, 8)}{pic("ivory", 48, 60, 8)}<span style="flex: 1; font-size: 13px; line-height: 18px; color: {MUTE}; padding-left: 4px">Arani silk saree, Kasavu cotton saree</span></div>', 16, 10)}
    <div style="display: flex; gap: 10px; padding: 12px; border-radius: 10px; background: {T4}; font-size: 12px; line-height: 18px; color: {MUTE}">{ic('receipt', 16, 2, P)}<span>Your tax invoice will be in Orders once the parcel ships. Updates come by SMS and WhatsApp.</span></div>
  </div>
  <div style="margin-top: auto; padding: 12px 16px 20px; display: flex; flex-direction: column; gap: 8px">{btn('Track order', href='OrderDetail.dc.html', icon='truck')}{btn('Continue shopping', 'ghost', href='Main.dc.html')}</div>'''))

# ------------------------------------------------------------------ Orders
def order(k, status, tone, date, name, oid, cta):
    return card(f'''<div style="display: flex; justify-content: space-between; align-items: center">{chip(status, tone=tone)}<span style="font-size: 12px; color: {MUTE}">{oid}</span></div>
      <div style="display: flex; gap: 12px">{pic(k, 60, 75, 8)}<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px; line-height: 20px; font-weight: 700">{name}</strong><span style="font-size: 13px; line-height: 18px; color: {MUTE}">{date}</span></div>{ic('right', 18, 2.200, MUTE)}</div>
      <div style="display: flex; gap: 8px">{cta}</div>''', 12, 10)


def sbtn(t, primary=False):
    st = f'background: {T1}; color: {PD}; border: 0' if primary else f'background: #FFFFFF; color: {INK}; border: 1px solid {T2}'
    return f'<span style="flex: 1; height: 32px; border-radius: 8px; {st}; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600">{t}</span>'


NAV = f'''<nav style="position: absolute; left: 16px; right: 16px; bottom: 12px; height: 56px; border-radius: 20px; {GLASS}; border: 1px solid rgba(231, 227, 245, 0.95); display: grid; grid-template-columns: repeat(4, 1fr); align-items: center">''' + ''.join(
    f'<span style="display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11px; font-weight: 600; color: {MUTE}">{ic(i, 20, 1.800)}{t}</span>' for i, t in [('home', 'Home'), ('layout', 'Categories'), ('spark', 'Try-on'), ('bag', 'Bag')]) + '</nav>'

boards['Orders'] = ('Alar orders', 390, 1010, phone(1010, hdr('My orders', 'Main.dc.html', ic('search', 20, 2, INK)) + f'''
  <div style="display: flex; gap: 8px; padding: 12px 16px; overflow: hidden; background: #FFFFFF; border-bottom: 1px solid {LINE}">{chip('All', True)}{chip('On the way')}{chip('Delivered')}{chip('Returns')}</div>
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {order('maroon', 'ON THE WAY', 'lav', 'Arrives by Tue, 1 Dec', 'Arani silk saree + 1 more', 'AL-2611-00418', sbtn('Track', True) + sbtn('Need help'))}
    {order('emerald', 'DELIVERED', 'green', 'Delivered on 12 Nov', 'Kanchipuram silk saree', 'AL-2611-00287', sbtn('Rate') + sbtn('Return or exchange') + sbtn('Invoice'))}
    {order('peacock', 'REFUNDED', 'grey', 'Refund of ₹2,400 sent on 2 Nov', 'Soft silk saree', 'AL-2610-00193', sbtn('View details') + sbtn('Buy again'))}
    {order('mustard', 'DELIVERED', 'green', 'Delivered on 18 Oct', 'Chettinad cotton saree', 'AL-2610-00102', sbtn('Rate') + sbtn('Invoice'))}
  </div>''' + NAV, PAGE))

# ------------------------------------------------------------------ Order detail
def tl(t, s, state, last=False):
    c = P if state != 'todo' else '#CFCBDD'
    dot = f'<span style="width: 18px; height: 18px; border-radius: 999px; background: {c if state == "done" else "#FFFFFF"}; border: 2px solid {c}; box-sizing: border-box; color: #FFFFFF; display: inline-flex; align-items: center; justify-content: center">{ic("check", 10, 3.500) if state == "done" else (f"<span style=\'width: 8px; height: 8px; border-radius: 999px; background: {P}\'></span>" if state == "on" else "")}</span>'
    ln = '' if last else f'<span style="flex: 1; width: 2px; min-height: 22px; background: {c if state == "done" else T2}"></span>'
    return f'<div style="display: flex; gap: 12px"><span style="display: flex; flex-direction: column; align-items: center">{dot}{ln}</span><span style="display: flex; flex-direction: column; padding-bottom: {0 if last else 12}px"><strong style="font-size: 14px; line-height: 18px; font-weight: {700 if state != "todo" else 500}; color: {INK if state != "todo" else MUTE}">{t}</strong><span style="font-size: 12px; line-height: 16px; color: {MUTE}">{s}</span></span></div>'


def linkrow(i, t):
    return f'<a href="#{i}" style="display: flex; align-items: center; gap: 12px; height: 44px; color: {INK}; font-size: 14px; font-weight: 600; text-decoration: none">{ic(i, 18, 2, P)}<span style="flex: 1">{t}</span>{ic("right", 16, 2.200, MUTE)}</a>'


boards['OrderDetail'] = ('Alar order detail', 390, 1100, phone(1100, hdr('Order AL-2611-00418', 'Orders.dc.html', sub='Placed on 27 Nov 2026') + f'''
  <div style="padding: 12px 16px 24px; display: flex; flex-direction: column; gap: 12px">
    {card(f"""<div style="display: flex; justify-content: space-between; align-items: center"><div style="display: flex; flex-direction: column"><span style="font-size: 12px; color: {MUTE}">Arrives by</span><strong style="{HF}; font-size: 16px; font-weight: 800">Tue, 1 Dec</strong></div>{chip('ON THE WAY', tone='lav')}</div>
      <div style="display: flex; flex-direction: column">{tl('Order confirmed', 'Fri 27 Nov, 6:42 pm', 'done')}{tl('Packed', 'Sat 28 Nov, 11:10 am', 'done')}{tl('Shipped', 'Sat 28 Nov, 5:30 pm · AWB 7731 0042 118', 'on')}{tl('Out for delivery', 'Expected Tue 1 Dec', 'todo')}{tl('Delivered', '', 'todo', True)}</div>""", 16, 14)}
    {card(f"""<div style="display: flex; gap: 12px">{pic('maroon', 60, 75, 8)}<div style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px; line-height: 20px; font-weight: 700">Arani silk saree</strong><span style="font-size: 12px; color: {MUTE}">Maroon · With blouse piece · Qty 1</span><span style="{HF}; font-size: 14px; font-weight: 800">₹3,150</span></div></div>
      <span style="height: 1px; background: {LINE}"></span>
      <div style="display: flex; gap: 12px">{pic('ivory', 60, 75, 8)}<div style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px; line-height: 20px; font-weight: 700">Kasavu cotton saree</strong><span style="font-size: 12px; color: {MUTE}">Ivory · With blouse piece · Qty 1</span><span style="{HF}; font-size: 14px; font-weight: 800">₹1,800</span></div></div>""", 12, 12)}
    {card(h2('Delivery address', 14) + f'<span style="font-size: 13px; line-height: 20px; color: {MUTE}"><strong style="color: {INK}; font-weight: 700">Lakshmi Narayanan</strong><br>14, 2nd Cross Street, Mandaveli, Chennai, Tamil Nadu 600028<br>+91 98400 12345</span>', 12, 6)}
    {card(h2('Payment', 14) + row('Total MRP', '₹5,600') + row('Discount', '− ₹650', color=GREEN) + row('Delivery', 'FREE', color=GREEN) + f'<span style="height: 1px; background: {LINE}"></span>' + row('Paid by UPI', '₹4,950', True), 12, 8)}
    {card(linkrow('receipt', 'Download invoice') + f'<span style="height: 1px; background: {LINE}"></span>' + linkrow('undo', 'Return or exchange (after delivery)') + f'<span style="height: 1px; background: {LINE}"></span>' + linkrow('help', 'Help with this order'), 12, 0, 'padding-top: 4px; padding-bottom: 4px')}
  </div>''', PAGE))

# ================================================================== ADMIN (web, 1440 x 900)
SIDE = [('chart', 'Dashboard', 'AdminDashboard'), ('box', 'Products', 'AdminProducts'), ('receipt', 'Orders', 'AdminOrders'), ('undo', 'Returns', ''),
        ('users', 'Customers', 'AdminCustomers'), ('layout', 'App content', 'AdminContent'), ('spark', 'AI try-on', 'AdminAI'), ('tag', 'Offers', ''), ('gear', 'Settings', '')]


def admin(active, title, actions, body, crumbs=''):
    items = ''
    for i, t, f in SIDE:
        on = t == active
        st = f'background: {T1}; color: {PD}; font-weight: 700' if on else f'color: {INK}; font-weight: 500'
        badge = f'<span style="margin-left: auto; min-width: 20px; height: 18px; padding: 0 5px; box-sizing: border-box; border-radius: 999px; background: {P}; color: #FFFFFF; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">6</span>' if t == 'Orders' else ''
        items += f'<a href="{f + ".dc.html" if f else "#"}" style="display: flex; align-items: center; gap: 10px; height: 36px; padding: 0 10px; border-radius: 8px; font-size: 13px; text-decoration: none; {st}">{ic(i, 18, 1.800)}{t}{badge}</a>'
    cr = f'<span style="font-size: 12px; line-height: 16px; color: {MUTE}">{crumbs}</span>' if crumbs else ''
    return f'''<div style="width: 1440px; height: 900px; box-sizing: border-box; overflow: hidden; background: {PAGE}; color: {INK}; {BODY}; display: flex">
  <aside style="width: 224px; flex-shrink: 0; background: #FFFFFF; border-right: 1px solid {LINE}; padding: 16px 12px; box-sizing: border-box; display: flex; flex-direction: column; gap: 4px">
    <div style="display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 10px; margin-bottom: 8px">{logo(22)}<span style="height: 20px; padding: 0 6px; border-radius: 5px; background: {INK}; color: #FFFFFF; font-size: 10px; font-weight: 700; letter-spacing: 0.06em; display: inline-flex; align-items: center">ADMIN</span></div>
    {items}
    <div style="margin-top: auto; display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 10px; border: 1px solid {LINE}"><span style="width: 32px; height: 32px; border-radius: 999px; background: {T1}; color: {PD}; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">AR</span><span style="display: flex; flex-direction: column; min-width: 0"><strong style="font-size: 13px; line-height: 18px; font-weight: 600">Arun</strong><span style="font-size: 11px; line-height: 14px; color: {MUTE}">Owner</span></span></div>
  </aside>
  <div style="flex: 1; min-width: 0; display: flex; flex-direction: column">
    <div style="height: 56px; flex-shrink: 0; background: #FFFFFF; border-bottom: 1px solid {LINE}; padding: 0 24px; display: flex; align-items: center; gap: 16px">
      <span style="display: flex; align-items: center; gap: 8px; width: 360px; height: 36px; box-sizing: border-box; padding: 0 12px; border-radius: 8px; border: 1px solid {T2}; font-size: 13px; color: #9B97AD">{ic('search', 16, 2, MUTE)}Search orders, products, customers</span>
      <span style="margin-left: auto; display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border-radius: 999px; background: #E3F4EC; color: {GREEN}; font-size: 12px; font-weight: 600"><span style="width: 6px; height: 6px; border-radius: 999px; background: {GREEN}"></span>Store live</span>
      <span style="color: {INK}">{ic('bell', 20, 1.800)}</span>
    </div>
    <div style="flex: 1; min-height: 0; padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px; overflow: hidden">
      <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: 16px"><div style="display: flex; flex-direction: column; gap: 2px">{cr}<h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800; letter-spacing: -0.01em">{title}</h1></div><div style="display: flex; gap: 8px">{actions}</div></div>
      {body}
    </div>
  </div>
</div>'''


def abtn(t, kind='ghost', icon=''):
    return btn(t, kind, icon=icon, h=36, extra='font-size: 13px; padding: 0 12px')


def table(cols, rows, widths):
    grid = ' '.join(widths)
    head = ''.join(f'<span>{c}</span>' for c in cols)
    out = f'<div style="display: grid; grid-template-columns: {grid}; gap: 12px; align-items: center; height: 36px; padding: 0 16px; background: {T4}; border-bottom: 1px solid {LINE}; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; color: {MUTE}; text-transform: uppercase">{head}</div>'
    for i, r in enumerate(rows):
        cells = ''.join(f'<span style="min-width: 0; display: flex; align-items: center; gap: 8px">{c}</span>' for c in r)
        bd = '' if i == len(rows) - 1 else f'border-bottom: 1px solid {LINE};'
        out += f'<div style="display: grid; grid-template-columns: {grid}; gap: 12px; align-items: center; min-height: 52px; padding: 0 16px; {bd} font-size: 13px; line-height: 18px">{cells}</div>'
    return f'<div style="background: #FFFFFF; border: 1px solid {LINE}; border-radius: 16px; overflow: hidden">{out}</div>'


def acard(inner, extra='', pad=16, gap=12):
    return f'<div style="background: #FFFFFF; border: 1px solid {LINE}; border-radius: 16px; padding: {pad}px; display: flex; flex-direction: column; gap: {gap}px; box-sizing: border-box; {extra}">{inner}</div>'


def kpi(t, v, d, tone=GREEN):
    return acard(f'<span style="font-size: 12px; line-height: 16px; font-weight: 600; color: {MUTE}">{t}</span><strong style="{HF}; font-size: 22px; line-height: 28px; font-weight: 800">{v}</strong><span style="font-size: 12px; line-height: 16px; font-weight: 600; color: {tone}">{d}</span>', 'flex: 1', 14, 4)


def afield(label, value, h=36, w='100%', sel=False, hint=''):
    caret = f'<span style="margin-left: auto; color: {MUTE}; transform: rotate(90deg); display: inline-flex">{ic("right", 14, 2.400)}</span>' if sel else ''
    al = 'flex-start; padding-top: 8px; padding-bottom: 8px' if h > 40 else 'center'
    hi = f'<span style="font-size: 11px; line-height: 16px; color: {MUTE}">{hint}</span>' if hint else ''
    return f'<label style="display: flex; flex-direction: column; gap: 4px; width: {w}; min-width: 0"><span style="font-size: 12px; line-height: 16px; font-weight: 600">{label}</span><span style="display: flex; align-items: {al}; min-height: {h}px; box-sizing: border-box; padding-left: 10px; padding-right: 10px; border-radius: 8px; border: 1px solid {T2}; background: #FFFFFF; font-size: 13px; line-height: 20px">{value}{caret}</span>{hi}</label>'


def bold(t):
    return f'<strong style="font-weight: 600">{t}</strong>'


def mute(t):
    return f'<span style="color: {MUTE}">{t}</span>'


def tabs(names, on):
    return f'<div style="display: flex; gap: 20px; border-bottom: 1px solid {LINE}">' + ''.join(
        f'<span style="height: 36px; display: inline-flex; align-items: center; font-size: 13px; font-weight: {700 if n == on else 500}; color: {INK if n == on else MUTE}; border-bottom: 2px solid {P if n == on else "transparent"}">{n}</span>' for n in names) + '</div>'


# ---- Admin login
def loginpanel(step, inner):
    return f'<div style="width: 400px; background: #FFFFFF; border: 1px solid {LINE}; border-radius: 20px; padding: 28px; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px"><span style="font-size: 12px; font-weight: 700; letter-spacing: 0.06em; color: {PD}">{step}</span>{inner}</div>'


def otpa(d, on=False):
    return f'<span style="flex: 1; height: 48px; border-radius: 10px; border: {"2px solid " + P if on else "1px solid " + T2}; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; {HF}; font-size: 20px; font-weight: 700">{d}</span>'


boards['AdminLogin'] = ('Alar admin login', 1440, 900, f'''<div style="width: 1440px; height: 900px; box-sizing: border-box; overflow: hidden; background: {PAGE}; color: {INK}; {BODY}; display: flex">
  <div style="width: 480px; flex-shrink: 0; position: relative; background: {INK}">{img('wedding', '82% center')}
    <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(27, 21, 48, 0.2) 0%, rgba(27, 21, 48, 0.86) 100%)"></div>
    <div style="position: absolute; left: 40px; right: 40px; bottom: 40px; display: flex; flex-direction: column; gap: 8px; color: #FFFFFF"><span style="{HF}; font-size: 28px; font-weight: 800; letter-spacing: -0.03em">alar <span style="font-size: 12px; letter-spacing: 0.08em; font-weight: 700; padding: 3px 7px; border-radius: 5px; background: #FFFFFF; color: {INK}; vertical-align: middle">ADMIN</span></span><span style="font-size: 14px; line-height: 22px; color: rgba(255, 255, 255, 0.82)">Catalogue, stock, orders, app content and AI try-on controls in one place.</span></div>
  </div>
  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px">
    <div style="display: flex; gap: 24px; align-items: stretch">
      {loginpanel('STEP 1 · PASSWORD', f"""<h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800">Sign in to admin</h1>
        {afield('Work email', 'owner@alar.example', 40)}{afield('Password', '••••••••••••', 40)}
        <div style="display: flex; justify-content: space-between; font-size: 13px"><label style="display: flex; align-items: center; gap: 8px"><input type="checkbox" style="width: 16px; height: 16px; accent-color: {P}; margin: 0">Trust this device for 30 days</label><a href="#reset" style="font-weight: 600; text-decoration: none">Forgot password?</a></div>
        {btn('Continue')}
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: {MUTE}"><span style="flex: 1; height: 1px; background: {LINE}"></span>or<span style="flex: 1; height: 1px; background: {LINE}"></span></div>
        <a href="#google" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 40px; border-radius: 8px; border: 1px solid {T2}; color: {INK}; font-size: 14px; font-weight: 600; text-decoration: none">{GOOGLE}Continue with Google</a>""")}
      {loginpanel('STEP 2 · ONE-TIME CODE', f"""<h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800">Enter the code</h1>
        <p style="margin: 0; font-size: 13px; line-height: 20px; color: {MUTE}">Sent to <strong style="color: {INK}; font-weight: 600">ow•••@alar.example</strong> and by SMS to the number ending 345. Needed on every sign-in, with password or Google.</p>
        <div style="display: flex; gap: 8px">{otpa('7')}{otpa('2')}{otpa('9')}{otpa('0')}{otpa('', True)}{otpa('')}</div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; color: {MUTE}"><span>Works for 5 minutes</span><span style="font-weight: 600">Send again in 0:41</span></div>
        {btn('Verify and sign in', href='AdminDashboard.dc.html')}
        <div style="display: flex; gap: 10px; padding: 12px; border-radius: 10px; background: {T4}; font-size: 12px; line-height: 18px; color: {MUTE}">{ic('shield', 16, 2, P)}<span>Only invited staff can sign in. Five wrong codes lock the account for 15 minutes and the owner is told.</span></div>""")}
    </div>
    <span style="font-size: 12px; color: {MUTE}">Every sign-in and change is written to the audit log.</span>
  </div>
</div>''')

# ---- Dashboard
bars = [(38, 'Sat'), (52, 'Sun'), (31, 'Mon'), (44, 'Tue'), (60, 'Wed'), (73, 'Thu'), (88, 'Fri')]
chart = '<div style="display: flex; align-items: flex-end; gap: 14px; height: 168px; padding-top: 8px">' + ''.join(
    f'<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; height: 100%; justify-content: flex-end"><span style="font-size: 11px; font-weight: 600; color: {MUTE}">₹{v * 550 // 1000}k</span><span style="width: 100%; height: {v}%; border-radius: 6px 6px 0 0; background: {P if d == "Fri" else T3}"></span><span style="font-size: 11px; color: {MUTE}">{d}</span></div>' for v, d in bars) + '</div>'


def low(k, n, v, s):
    return f'<div style="display: flex; align-items: center; gap: 10px">{pic(k, 32, 40, 6)}<span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><strong style="font-size: 13px; line-height: 18px; font-weight: 600">{n}</strong><span style="font-size: 12px; line-height: 16px; color: {MUTE}">{v}</span></span>{chip(s, tone="amber" if "left" in s else "red")}</div>'


boards['AdminDashboard'] = ('Alar admin dashboard', 1440, 900, admin('Dashboard', 'Good evening, Arun', abtn('Today', 'ghost') + abtn('Export', 'ghost', 'download'), f'''
  <div style="display: flex; gap: 16px">{kpi("Today's sales", '₹48,200', '▲ 18% vs last Friday')}{kpi('Orders', '14', '6 to pack now', AMBER)}{kpi('Try-ons today', '212', '▲ 31 vs yesterday')}{kpi('Try-on to bag', '18%', 'Shoppers who tried on, then added')}{kpi('AI spend today', '₹1,060', '53% of ₹2,000 daily limit', MUTE)}</div>
  <div style="display: grid; grid-template-columns: minmax(0, 1.500fr) minmax(0, 1fr); gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {acard(f'<div style="display: flex; justify-content: space-between; align-items: center">{h2("Sales, last 7 days", 14)}<span style="font-size: 12px; color: {MUTE}">Total ₹2,12,300</span></div>{chart}')}
      {table(['Order', 'Customer', 'Items', 'Amount', 'Payment', 'Status'], [
        [bold('AL-2611-00418'), 'Lakshmi N.', '2', bold('₹4,950'), chip('PAID', tone='green'), chip('TO PACK', tone='amber')],
        [bold('AL-2611-00417'), 'Divya R.', '1', bold('₹3,400'), chip('PAID', tone='green'), chip('TO PACK', tone='amber')],
        [bold('AL-2611-00416'), 'Meena K.', '1', bold('₹2,100'), chip('PAID', tone='green'), chip('SHIPPED', tone='lav')],
        [bold('AL-2611-00415'), 'Sangeetha V.', '3', bold('₹8,250'), chip('PENDING', tone='grey'), chip('HOLD 9 MIN', tone='grey')]],
        ['1.300fr', '1.200fr', '0.500fr', '0.800fr', '0.800fr', '1fr'])}
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {acard(f'<div style="display: flex; justify-content: space-between; align-items: center">{h2("Low stock", 14)}<a href="AdminProducts.dc.html" style="font-size: 12px; font-weight: 600; text-decoration: none">View all 6</a></div>' + low('maroon', 'Arani silk saree', 'Maroon', '3 left') + low('emerald', 'Kanchipuram silk saree', 'Emerald', '1 left') + low('navy', 'Banarasi silk saree', 'Navy', 'Sold out') + low('shirt', 'Handloom cotton shirt', 'Navy · 42', '2 left'))}
      {acard(h2('AI try-on health', 14) + row('Success rate (24 h)', bold('96.2%')) + row('Median time', bold('14 s')) + row('Blocked by checks', bold('7')) + row('Reports from shoppers', f'<span style="font-weight: 600; color: {AMBER}">2 to review</span>') + f'<div style="height: 8px; border-radius: 999px; background: {T1}; overflow: hidden"><span style="display: block; width: 53%; height: 100%; background: {P}"></span></div><span style="font-size: 12px; color: {MUTE}">Try-on pauses by itself when the daily limit is reached.</span>', gap=8)}
    </div>
  </div>'''))

# ---- Products
def prow(k, n, sku, cat, var, stock, stone, price, st, sttone, tryon):
    return [pic(k, 36, 45, 6) + f'<span style="display: flex; flex-direction: column; min-width: 0">{bold(n)}<span style="font-size: 12px; color: {MUTE}">{sku}</span></span>', cat, var, chip(stock, tone=stone), bold(price), chip(st, tone=sttone), toggle(tryon), mute(ic('right', 16, 2.200))]


boards['AdminProducts'] = ('Alar admin products', 1440, 900, admin('Products', 'Products', abtn('Import CSV', 'ghost', 'download') + abtn('Add product', 'primary', 'plus'), f'''
  <div style="display: flex; align-items: center; gap: 8px">
    <span style="display: flex; align-items: center; gap: 8px; width: 280px; height: 36px; box-sizing: border-box; padding: 0 12px; border-radius: 8px; border: 1px solid {T2}; background: #FFFFFF; font-size: 13px; color: #9B97AD">{ic('search', 16, 2, MUTE)}Search name or SKU</span>
    {chip('All 104', True)}{chip('Sarees 96')}{chip('Shirts 6')}{chip('Dhotis 2')}
    <span style="margin-left: auto; display: flex; gap: 8px">{abtn('Status: Any')}{abtn('Stock: Any')}{abtn('Filters', icon='filter')}</span>
  </div>
  {table(['Product', 'Category', 'Variants', 'Stock', 'Price', 'Status', 'Try-on', ''], [
    prow('maroon', 'Arani silk saree', 'AL-SR-0001', 'Sarees · Silk', '4 colours', '3 LEFT', 'amber', '₹3,150', 'LIVE', 'green', True),
    prow('violet', 'Kanchipuram silk saree', 'AL-SR-0002', 'Sarees · Silk', '3 colours', '27 IN STOCK', 'green', '₹4,800', 'LIVE', 'green', True),
    prow('peacock', 'Soft silk saree', 'AL-SR-0003', 'Sarees · Silk', '5 colours', '41 IN STOCK', 'green', '₹2,400', 'LIVE', 'green', True),
    prow('ivory', 'Kasavu cotton saree', 'AL-SR-0004', 'Sarees · Cotton', '1 colour', '10 IN STOCK', 'green', '₹1,800', 'LIVE', 'green', False),
    prow('mustard', 'Chettinad cotton saree', 'AL-SR-0005', 'Sarees · Cotton', '3 colours', '22 IN STOCK', 'green', '₹1,650', 'LIVE', 'green', True),
    prow('rust', 'Tussar silk saree', 'AL-SR-0006', 'Sarees · Silk', '2 colours', '14 IN STOCK', 'green', '₹3,900', 'DRAFT', 'grey', False),
    prow('navy', 'Banarasi silk saree', 'AL-SR-0007', 'Sarees · Silk', '2 colours', 'SOLD OUT', 'red', '₹4,950', 'LIVE', 'green', True),
    prow('shirt', 'Handloom cotton shirt', 'AL-SH-0001', 'Shirts · Men', '4 colours · 6 sizes', '2 LEFT', 'amber', '₹1,350', 'DRAFT', 'grey', False)],
    ['2.400fr', '1.200fr', '1.200fr', '1fr', '0.700fr', '0.700fr', '0.600fr', '24px'])}
  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: {MUTE}"><span>Showing 1 to 8 of 104</span><span style="display: flex; gap: 6px">{chip('1', True)}{chip('2')}{chip('3')}{chip('Next')}</span></div>'''))

# ---- Product edit
def mthumb(k, pos='center top', main=False):
    tag = f'<span style="position: absolute; left: 4px; top: 4px; height: 18px; padding: 0 6px; border-radius: 4px; background: {P}; color: #FFFFFF; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center">MAIN</span>' if main else ''
    return f'<span style="width: 84px; height: 105px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; border: 1px solid {LINE}; flex-shrink: 0; display: block">{img(k, pos)}{tag}</span>'


def vrow(k, c, sku, stock, hold, price, on=True):
    box = lambda v, w=64: f'<span style="width: {w}px; height: 32px; box-sizing: border-box; border: 1px solid {T2}; border-radius: 8px; display: inline-flex; align-items: center; padding: 0 8px; font-size: 13px; font-weight: 600">{v}</span>'
    return [pic(k, 28, 35, 5) + bold(c), mute(sku), box(stock), mute(hold), box(price, 84), toggle(on)]


boards['AdminProductEdit'] = ('Alar admin product edit', 1440, 900, admin('Products', 'Arani silk saree', abtn('Preview in app', 'ghost', 'eye') + abtn('Discard') + abtn('Save changes', 'primary'), f'''
  <div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.250fr); gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {acard(h2('Details', 14) + afield('Name', 'Arani silk saree') + afield('Description', 'Maroon silk saree with a gold temple border and a striped pallu. Comes with an unstitched blouse piece.', 60) + f'<div style="display: flex; gap: 12px">{afield("Category", "Sarees › Silk", sel=True)}{afield("Tax band", "5% (fabric)", sel=True)}</div><div style="display: flex; gap: 12px">{afield("Fabric", "Pure silk", sel=True)}{afield("Weave", "Arani", sel=True)}{afield("Length", "6.2 m + 0.8 m blouse")}</div>', gap=10)}
      {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Weaver", 14)}{chip("ADMIN ONLY · HIDDEN FROM SHOPPERS", tone="grey")}</div><div style="display: flex; gap: 12px">{afield("Weaver", "Family loom 03, Arani", sel=True)}{afield("Cost per piece", "₹2,050")}{afield("Batch", "NOV-26-A")}</div>', gap=10)}
      {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Photos", 14)}<span style="font-size: 12px; color: {MUTE}">Drag to reorder · 4:5 · full saree 21:9</span></div><div style="display: flex; gap: 8px">{mthumb("maroon", main=True)}{mthumb("maroon", "center 80%")}<span style="width: 84px; height: 105px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; border: 1px solid {LINE}; display: block"><img src="/_blob/ac67b8a2968740f77ab203c324b3f86b" alt="" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block"></span><span style="width: 180px; height: 105px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; border: 1px solid {LINE}; display: block"><img src="/_blob/5ad786513b9724fe51ec5dfd3729c532" alt="" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block"><span style="position: absolute; left: 4px; top: 4px; height: 18px; padding: 0 6px; border-radius: 4px; background: {INK}; color: #FFFFFF; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center">FULL SAREE</span></span><span style="width: 84px; height: 105px; border-radius: 10px; border: 1px dashed {T3}; background: {T4}; color: {PD}; display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 12px; font-weight: 600">{ic("plus", 18, 2.200)}Add</span></div><label style="display: flex; align-items: center; gap: 8px; font-size: 13px"><input type="checkbox" checked style="width: 16px; height: 16px; accent-color: {P}; margin: 0">I confirm these photos show the true colour of the real saree</label>', gap=10)}
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Variants and stock", 14)}<span style="display: flex; gap: 8px">{abtn("Add colour", icon="plus")}{abtn("Add size", icon="plus")}</span></div>' + table(['Colour', 'SKU', 'In stock', 'On hold', 'Price (₹)', 'Live'], [
        vrow('maroon', 'Maroon', 'AL-SR-0001-MRN', '3', '1 held', '3,150'), vrow('violet', 'Violet', 'AL-SR-0001-VLT', '10', '0', '3,150'),
        vrow('emerald', 'Emerald', 'AL-SR-0001-EMR', '8', '0', '3,300'), vrow('peacock', 'Peacock blue', 'AL-SR-0001-PCK', '0', '0', '3,150', False)],
        ['1.500fr', '1.400fr', '0.800fr', '0.700fr', '0.900fr', '0.500fr']) + f'<span style="font-size: 12px; line-height: 18px; color: {MUTE}">Prices are whole rupees and include tax. Sarees have colour only; shirts and other garments also get sizes. Every stock change is logged with who made it.</span>', gap=10)}
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px">
        {acard(h2('Pricing', 14) + f'<div style="display: flex; gap: 12px">{afield("MRP", "₹3,600")}{afield("Selling price", "₹3,150")}</div>' + row('Discount shown', bold('12% OFF')) + row('Tax inside price', '₹150') + row('Margin after tax', f'<span style="font-weight: 600; color: {GREEN}">₹950 (32%)</span>'), gap=8)}
        {acard(h2('Visibility', 14) + f'<div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px"><span>Live in the store</span>{toggle(True)}</div><div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px"><span>Try-on ready</span>{toggle(True)}</div><div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px"><span>Show "Just in" label</span>{toggle(True)}</div><div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px"><span>Low-stock alert below</span><strong style="font-weight: 600">4 pieces</strong></div>', gap=10)}
      </div>
    </div>
  </div>''', 'Products › Sarees › AL-SR-0001'))

# ---- Orders
def orow(oid, cust, items, amt, pay, ptone, st, stone, ship, when, sel=False):
    return [bold(oid), cust, items, bold(amt), chip(pay, tone=ptone), chip(st, tone=stone), mute(ship), mute(when)]


boards['AdminOrders'] = ('Alar admin orders', 1440, 900, admin('Orders', 'Orders', abtn('Export', 'ghost', 'download') + abtn('Print 6 labels', 'primary', 'receipt'), f'''
  {tabs(['All 418', 'To pack 6', 'Shipped 11', 'Delivered 389', 'Returns 4', 'Payment pending 2'], 'To pack 6')}
  <div style="display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 12px; min-width: 0">
      {table(['Order', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Shipment', 'Placed'], [
        orow('AL-2611-00418', 'Lakshmi N.', '2', '₹4,950', 'PAID', 'green', 'TO PACK', 'amber', 'Not booked', '6:42 pm'),
        orow('AL-2611-00417', 'Divya R.', '1', '₹3,400', 'PAID', 'green', 'TO PACK', 'amber', 'Not booked', '5:58 pm'),
        orow('AL-2611-00414', 'Kavitha S.', '1', '₹1,800', 'PAID', 'green', 'TO PACK', 'amber', 'AWB booked', '3:20 pm'),
        orow('AL-2611-00412', 'Revathi M.', '2', '₹6,300', 'PAID', 'green', 'TO PACK', 'amber', 'AWB booked', '1:05 pm'),
        orow('AL-2611-00411', 'Anitha P.', '1', '₹2,400', 'PAID', 'green', 'TO PACK', 'amber', 'Not booked', '12:44 pm'),
        orow('AL-2611-00409', 'Shanthi G.', '1', '₹3,150', 'PAID', 'green', 'TO PACK', 'amber', 'Not booked', '11:30 am')],
        ['1.400fr', '1.100fr', '0.500fr', '0.800fr', '0.700fr', '0.900fr', '1fr', '0.700fr'])}
      <span style="font-size: 12px; color: {MUTE}">An order shows as Paid only after Razorpay confirms it to our server. Stock is taken from the hold at that moment.</span>
    </div>
    {acard(f"""<div style="display: flex; justify-content: space-between; align-items: center">{h2('AL-2611-00418', 16)}{chip('TO PACK', tone='amber')}</div>
      <div style="display: flex; gap: 10px">{pic('maroon', 44, 55, 6)}<span style="flex: 1; display: flex; flex-direction: column; font-size: 13px; line-height: 18px">{bold('Arani silk saree')}{mute('Maroon · AL-SR-0001-MRN · Qty 1')}</span>{bold('₹3,150')}</div>
      <div style="display: flex; gap: 10px">{pic('ivory', 44, 55, 6)}<span style="flex: 1; display: flex; flex-direction: column; font-size: 13px; line-height: 18px">{bold('Kasavu cotton saree')}{mute('Ivory · AL-SR-0004-IVR · Qty 1')}</span>{bold('₹1,800')}</div>
      <span style="height: 1px; background: {LINE}"></span>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; line-height: 18px">{row('Customer', 'Lakshmi Narayanan')}{row('Mobile', '+91 98400 12345')}{row('Ship to', 'Chennai 600028')}{row('Paid', 'UPI · pay_Qx81…k2')}{row('Invoice', 'Made at shipping')}</div>
      <span style="height: 1px; background: {LINE}"></span>
      <div style="display: flex; flex-direction: column; gap: 8px">{btn('Book courier and print label', 'primary', icon='truck', h=36, extra='font-size: 13px')}<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{abtn('Mark packed')}{abtn('Cancel and refund')}</div></div>
      <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; line-height: 18px; color: {MUTE}">{bold('History')}<span>6:42 pm · Payment confirmed by Razorpay</span><span>6:41 pm · Stock held for 15 minutes</span><span>6:39 pm · Order started in the app</span></div>""", gap=12)}
  </div>'''))

# ---- AI controls
def airow(n, prov, model, cost, ok, t, on, role):
    return [f'<span style="color: {MUTE}">{ic("drag", 16, 3)}</span>' + bold(str(n)), f'<span style="display: flex; flex-direction: column">{bold(model)}<span style="font-size: 12px; color: {MUTE}">{prov}</span></span>', chip(role, tone='lav' if role == 'PRIMARY' else 'grey'), cost, ok, t, toggle(on)]


boards['AdminAI'] = ('Alar admin AI try-on', 1440, 900, admin('AI try-on', 'AI try-on controls', abtn('Test with a sample photo', 'ghost', 'spark') + abtn('Save changes', 'primary'), f'''
  {tabs(['Models and routing', 'Prompts', 'Safety checks', 'Consent notice', 'Reports 2', 'Usage and cost'], 'Models and routing')}
  <div style="display: grid; grid-template-columns: minmax(0, 1.450fr) minmax(0, 1fr); gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {table(['Order', 'Model', 'Role', 'Cost / image', 'Success (7 d)', 'Median time', 'On'], [
        airow(1, 'OpenRouter · Google', 'Gemini image (Nano Banana Pro)', '₹5.20', bold('96.2%'), '14 s', True, 'PRIMARY'),
        airow(2, 'OpenRouter · OpenAI', 'GPT Image', '₹7.80', bold('94%'), '21 s', True, 'FALLBACK'),
        airow(3, 'FASHN', 'Try-on v1.6', '₹6.30', bold('91.5%'), '11 s', False, 'FALLBACK')],
        ['0.600fr', '2.200fr', '0.900fr', '0.900fr', '0.900fr', '0.800fr', '0.500fr'])}
      {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Prompt · Saree, Nivi drape", 14)}<span style="display: flex; align-items: center; gap: 8px">{chip("VERSION 7 · LIVE", tone="green")}{abtn("History")}</span></div><div style="border: 1px solid {T2}; border-radius: 10px; padding: 12px; background: {T4}; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 20px; color: {INK}">Dress the person in the first image in the saree shown in the second image.<br>Keep the face, hair, skin tone, body shape and background exactly as they are.<br>Drape: Nivi style, pallu over the left shoulder, pleats at the front.<br>Copy the saree colour, border and pallu pattern exactly: <span style="color: {PD}; font-weight: 700">{{{{design.attributes}}}}</span>.<br>Blouse: plain, colour <span style="color: {PD}; font-weight: 700">{{{{design.blouse_colour}}}}</span>. No text, no watermark.</div><div style="display: flex; gap: 12px">{afield("Used for category", "Sarees", sel=True)}{afield("Output size", "1536 × 1920", sel=True)}{afield("Retries before fallback", "1")}</div>', gap=10)}
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {acard(h2('Limits', 14) + f'<div style="display: flex; gap: 12px">{afield("Daily spend limit", "₹2,000")}{afield("Try-ons per shopper per day", "5")}</div><div style="display: flex; gap: 12px">{afield("Monthly spend limit", "₹45,000")}{afield("Delete unused photos after", "30 days")}</div><div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px"><span>Pause try-on for everyone</span>{toggle(False)}</div>', gap=10)}
      {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Safety checks", 14)}{chip("ALWAYS ON · SET IN CODE", tone="grey")}</div>' + ''.join(f'<div style="display: flex; align-items: center; gap: 10px; font-size: 13px; line-height: 18px"><span style="width: 18px; height: 18px; border-radius: 999px; background: #E3F4EC; color: {GREEN}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0">{ic("check", 12, 3)}</span>{t}</div>' for t in ['Adults only: shopper confirms 18+, photos that look like a child are refused', 'One person in the photo, fully clothed', 'Result checked before it is shown; failed results are not charged to the shopper', 'Shopper can report any result; reported results are hidden until reviewed']), gap=10)}
      {acard(h2('Consent notice', 14) + row('Live version', bold('v3 · 20 Nov 2026')) + row('AI services named', 'Google, OpenAI via OpenRouter') + row('Shoppers on older version', f'<span style="font-weight: 600; color: {AMBER}">41 will be asked again</span>') + f'<span style="font-size: 12px; line-height: 18px; color: {MUTE}">Turning on a model from a new company needs a new notice version first.</span>', gap=8)}
    </div>
  </div>'''))

# ---- App content (SDUI)
def blk(i, t, s, on=False, vis=True):
    bd = f'1.500px solid {P}' if on else f'1px solid {LINE}'
    return f'<div style="display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 10px; border-radius: 10px; border: {bd}; background: {T4 if on else "#FFFFFF"}"><span style="color: {MUTE}">{ic("drag", 16, 3)}</span><span style="color: {P}">{ic(i, 18, 1.800)}</span><span style="flex: 1; min-width: 0; display: flex; flex-direction: column"><strong style="font-size: 13px; line-height: 18px; font-weight: 600">{t}</strong><span style="font-size: 11px; line-height: 14px; color: {MUTE}">{s}</span></span>{toggle(vis)}</div>'


def mini_card(k):
    return f'<div style="display: flex; flex-direction: column; gap: 3px"><span style="height: 92px; border-radius: 6px; overflow: hidden; position: relative; background: {GROUND}; display: block">{img(k)}</span><span style="height: 5px; width: 70%; border-radius: 3px; background: {T2}"></span><span style="height: 5px; width: 40%; border-radius: 3px; background: {T3}"></span></div>'


PREVIEW = f'''<div style="width: 250px; height: 520px; border-radius: 28px; border: 6px solid {INK}; background: #FFFFFF; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; gap: 8px; padding: 10px 8px 0">
  <div style="display: flex; align-items: center; gap: 4px; font-size: 9px; font-weight: 600">{ic('pin', 10, 2.400, P)}Deliver to Lakshmi, 600028</div>
  <div style="height: 26px; border-radius: 7px; border: 1px solid {T2}; display: flex; align-items: center; gap: 6px; padding: 0 8px; font-size: 9px; color: #9B97AD"><span style="{HF}; font-size: 11px; font-weight: 800; color: {P}">alar</span>Search for sarees</div>
  <div style="display: flex; gap: 10px; font-size: 9px; font-weight: 700"><span style="color: {P}">ALL</span><span style="color: {MUTE}">WOMEN</span><span style="color: {MUTE}">MEN</span><span style="color: {MUTE}">KIDS</span></div>
  <div style="display: flex; gap: 6px">''' + ''.join(f'<span style="width: 40px; height: 48px; border-radius: 9px; overflow: hidden; position: relative; background: {T1}; display: block; flex-shrink: 0">{img(k, "center")}</span>' for k in ['c_sarees', 'c_sarees', 'c_sarees', 'c_sarees', 'c_sarees']) + f'''</div>
  <div style="height: 132px; border-radius: 12px; overflow: hidden; position: relative; background: {INK}; outline: 2px solid {P}; outline-offset: 2px; flex-shrink: 0">{img('wedding', 'right center')}<div style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(20, 12, 10, 0.78) 0%, rgba(20, 12, 10, 0) 72%)"></div><span style="position: absolute; left: 8px; bottom: 8px; color: #FFFFFF; {HF}; font-size: 12px; font-weight: 800; line-height: 15px">WEDDING EDIT<br>SILKS FROM ₹3,200</span></div>
  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px">{mini_card('maroon')}{mini_card('peacock')}</div>
</div>'''

boards['AdminContent'] = ('Alar admin app content', 1440, 900, admin('App content', 'Home screen', abtn('Preview on my phone', 'ghost', 'phone') + abtn('Schedule') + abtn('Publish', 'primary'), f'''
  {tabs(['Home', 'Category pages', 'Product page', 'Banners', 'Legal pages', 'Published versions'], 'Home')}
  <div style="display: grid; grid-template-columns: 340px minmax(0, 1fr) 360px; gap: 16px; flex: 1; min-height: 0">
    {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Blocks", 14)}{abtn("Add block", icon="plus")}</div>' + blk('pin', 'Address bar', 'Fixed at the top') + blk('search', 'Search with logo', 'Fixed') + blk('layout', 'Department tabs', 'All · Women · Men · Kids') + blk('box', 'Category rail', '2 rows · 10 categories') + blk('image', 'Banner carousel', '4 banners · swipe, no auto-slide', True) + blk('truck', 'Service strip', 'Free delivery · 7 days return') + blk('tag', 'Product grid', 'New arrivals · 8 items') + blk('spark', 'Try-on promo', 'Hidden until 1 Dec', False, False), gap=8)}
    <div style="background: {T4}; border: 1px solid {LINE}; border-radius: 16px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px">
      <div style="display: flex; gap: 6px">{chip('Android', True)}{chip('Website')}</div>
      {PREVIEW}
      <span style="font-size: 12px; color: {MUTE}">Draft · changed 4 minutes ago · not published</span>
    </div>
    {acard(h2('Banner carousel', 14) + f'<span style="font-size: 12px; line-height: 18px; color: {MUTE}">Banner 1 of 4</span>' + f'<span style="height: 120px; border-radius: 10px; overflow: hidden; position: relative; background: {INK}; display: block; flex-shrink: 0">{img("wedding", "right center")}</span>' + afield('Small label', 'WEDDING EDIT') + afield('Headline', 'SILKS FROM ₹3,200') + afield('Opens', 'Category › Wedding silks', sel=True) + f'<div style="display: flex; gap: 12px">{afield("Show from", "27 Nov 2026")}{afield("Until", "15 Jan 2027")}</div>' + f'<div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px"><span>Dark scrim under the text</span>{toggle(True)}</div><div style="display: flex; gap: 8px">{abtn("Replace image", icon="image")}{abtn("Remove", icon="trash")}</div><span style="font-size: 11px; line-height: 16px; color: {MUTE}">Changes reach the app without a new release. Older app versions keep showing blocks they understand.</span>', gap=10)}
  </div>'''))

# ---- Customers
def crow(n, mob, via, orders, spent, tryons, cons, ctone, st, sttone):
    ini = ''.join(w[0] for w in n.split()[:2])
    return [f'<span style="width: 28px; height: 28px; border-radius: 999px; background: {T1}; color: {PD}; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0">{ini}</span>' + bold(n), mob, mute(via), orders, bold(spent), tryons, chip(cons, tone=ctone), chip(st, tone=sttone)]


boards['AdminCustomers'] = ('Alar admin customers', 1440, 900, admin('Customers', 'Customers and staff', abtn('Export', 'ghost', 'download') + abtn('Invite staff', 'primary', 'plus'), f'''
  {tabs(['Customers 1,284', 'Staff 3', 'Roles', 'Deletion requests 1', 'Audit log'], 'Customers 1,284')}
  <div style="display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 12px; min-width: 0">
      <div style="display: flex; align-items: center; gap: 8px"><span style="display: flex; align-items: center; gap: 8px; width: 280px; height: 36px; box-sizing: border-box; padding: 0 12px; border-radius: 8px; border: 1px solid {T2}; background: #FFFFFF; font-size: 13px; color: #9B97AD">{ic('search', 16, 2, MUTE)}Search name, mobile or email</span>{chip('All', True)}{chip('Bought')}{chip('Tried on, not bought')}{chip('Blocked')}</div>
      {table(['Customer', 'Mobile', 'Signed in with', 'Orders', 'Spent', 'Try-ons', 'Try-on consent', 'Status'], [
        crow('Lakshmi Narayanan', '+91 98400 12345', 'Mobile OTP', '3', '₹11,250', '14', 'V3 AGREED', 'green', 'ACTIVE', 'green'),
        crow('Divya Raman', '+91 99620 44110', 'Google + OTP', '1', '₹3,400', '6', 'V3 AGREED', 'green', 'ACTIVE', 'green'),
        crow('Meena Krishnan', '+91 94440 78021', 'Mobile OTP', '2', '₹5,500', '0', 'NOT ASKED', 'grey', 'ACTIVE', 'green'),
        crow('Sangeetha Vel', '+91 90030 65512', 'Google + OTP', '0', '₹0', '9', 'V2 · ASK AGAIN', 'amber', 'ACTIVE', 'green'),
        crow('Kavitha Suresh', '+91 98840 20934', 'Mobile OTP', '4', '₹14,900', '22', 'WITHDRAWN', 'grey', 'ACTIVE', 'green'),
        crow('Revathi Mohan', '+91 97910 33487', 'Mobile OTP', '1', '₹6,300', '3', 'V3 AGREED', 'green', 'BLOCKED', 'red')],
        ['1.800fr', '1.300fr', '1.100fr', '0.600fr', '0.800fr', '0.600fr', '1.200fr', '0.800fr'])}
      <span style="font-size: 12px; color: {MUTE}">Try-on photos are never shown here. Staff see only counts and the consent record.</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px">
      {acard(h2('Staff and roles', 14) + ''.join(f'<div style="display: flex; align-items: center; gap: 10px"><span style="width: 32px; height: 32px; border-radius: 999px; background: {T1}; color: {PD}; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">{i}</span><span style="flex: 1; display: flex; flex-direction: column; font-size: 13px; line-height: 18px">{bold(n)}<span style="font-size: 12px; color: {MUTE}">{d}</span></span>{chip(r, tone=t)}</div>' for i, n, d, r, t in [('AR', 'Arun', 'Everything', 'OWNER', 'lav'), ('SK', 'Saranya K.', 'Products, stock, content', 'CATALOGUE', 'grey'), ('MV', 'Murugan V.', 'Orders, returns, labels', 'PACKING', 'grey')]) + f'<span style="font-size: 12px; line-height: 18px; color: {MUTE}">Staff sign in with password or Google, then a one-time code. Only the owner can change AI settings, prices and roles.</span>', gap=10)}
      {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Deletion request", 14)}{chip("DUE IN 5 DAYS", tone="amber")}</div><span style="font-size: 13px; line-height: 20px">Sangeetha Vel asked to delete her account and try-on photos on 25 Nov.</span><span style="font-size: 12px; line-height: 18px; color: {MUTE}">Invoices are kept as the tax law requires; everything else is erased.</span><div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{abtn("View record")}{abtn("Erase now", "primary")}</div>', gap=10)}
    </div>
  </div>'''))

# ------------------------------------------------------------------ write files + canvas
for name, (title, w, h, inner) in boards.items():
    open(os.path.join(OUT, name + '.dc.html'), 'w').write(page(title, w, h, inner))

c = json.load(open(os.path.join(OUT, 'canvas.json')))
bd = c['boards']
TITLES = dict(Onboarding='Onboarding', Login='Log in or sign up', Otp='OTP check', SignUp='Sign up details', TryOnPhoto='Try-on: choose photo',
              TryOnResult='Try-on result', Bag='Bag', Checkout='Checkout', OrderPlaced='Order confirmed', Orders='My orders', OrderDetail='Order detail',
              AdminLogin='Admin: sign in', AdminDashboard='Admin: dashboard', AdminProducts='Admin: products', AdminProductEdit='Admin: product, variants and stock',
              AdminOrders='Admin: orders', AdminAI='Admin: AI try-on controls', AdminContent='Admin: app content', AdminCustomers='Admin: customers and staff')
ROW1 = ['Onboarding', 'Login', 'Otp', 'SignUp']                       # y = -1100, above the shopping row
ROW3 = ['FullSaree', 'TryOnPhoto', 'TryOnResult', 'Bag', 'Checkout', 'OrderPlaced', 'Orders', 'OrderDetail']
ROW4 = ['AdminLogin', 'AdminDashboard', 'AdminProducts', 'AdminProductEdit', 'AdminOrders', 'AdminAI', 'AdminContent', 'AdminCustomers']
for i, n in enumerate(ROW1):
    bd[n + '.dc.html'] = dict(x=i * 470, y=-1100, w=390, h=boards[n][2], title=TITLES[n], radius=32)
for i, n in enumerate(ROW3):
    if n == 'FullSaree':
        bd['FullSaree.dc.html'].update(x=0, y=2380)
    else:
        bd[n + '.dc.html'] = dict(x=i * 470, y=2380, w=390, h=boards[n][2], title=TITLES[n], radius=32)
for i, n in enumerate(ROW4):
    bd[n + '.dc.html'] = dict(x=(i % 4) * 1520, y=3760 + (i // 4) * 1020, w=1440, h=900, title=TITLES[n], radius=16)
bd['Media.dc.html'].update(x=0, y=5960)
c['order'] = [n + '.dc.html' for n in ROW1] + ['Main.dc.html', 'Listing.dc.html', 'Product.dc.html', 'Shirt.dc.html', 'Consent.dc.html', 'Theme.dc.html'] + \
             [n + '.dc.html' for n in ROW3] + [n + '.dc.html' for n in ROW4] + ['Media.dc.html']
c['notes'] = {
    'heading': {'x': 0, 'y': -1500, 'text': 'Alar: lavender theme, all screens', 'kind': 'title1', 'maxW': 3390},
    'r1': {'x': 0, 'y': -1230, 'text': '1. Getting in: onboarding, login (mobile OTP or Google + OTP), sign up', 'kind': 'title2', 'maxW': 3390},
    'r2': {'x': 0, 'y': -130, 'text': '2. Shopping: home, listing, product pages, consent, theme', 'kind': 'title2', 'maxW': 3390},
    'r3': {'x': 0, 'y': 2250, 'text': '3. Try-on, bag, checkout and orders', 'kind': 'title2', 'maxW': 3390},
    'r4': {'x': 0, 'y': 3630, 'text': '4. Admin (web, 1440 wide)', 'kind': 'title2', 'maxW': 5000},
    'r5': {'x': 0, 'y': 5830, 'text': '5. Generated media', 'kind': 'title2', 'maxW': 3390},
}
json.dump(c, open(os.path.join(OUT, 'canvas.json'), 'w'), indent=2)
print(len(boards), 'boards written')
