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


ICON['grid'] = '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'


def nav(active):
    out = f'<nav aria-label="Main" style="position: absolute; left: 16px; right: 16px; bottom: 12px; height: 56px; box-sizing: border-box; padding: 0 8px; display: flex; justify-content: space-around; align-items: center; border-radius: 999px; background: rgba(255, 255, 255, 0.74); backdrop-filter: blur(20px) saturate(1.6); -webkit-backdrop-filter: blur(20px) saturate(1.6); border: 1px solid rgba(220, 211, 255, 0.95)">'
    for i, t, f in [('home', 'Home', 'Main'), ('grid', 'Categories', 'Categories'), ('spark', 'Try-on', 'TryOnHub'), ('bag', 'Bag', 'Bag')]:
        if t == active:
            out += f'<a href="{f}.dc.html" style="display: flex; align-items: center; justify-content: center; gap: 6px; height: 40px; padding: 0 16px; border-radius: 999px; background: {T1}; color: {PD}; font-size: 13px; font-weight: 600; text-decoration: none">{ic(i, 20, 2)}{t}</a>'
        else:
            out += f'<a href="{f}.dc.html" aria-label="{t}" style="display: flex; align-items: center; justify-content: center; width: 48px; height: 40px; color: {MUTE}; text-decoration: none">{ic(i, 22, 2)}</a>'
    return out + '</nav>'


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
    <a href="Otp.dc.html" style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 40px; border-radius: 8px; background: #FFFFFF; border: 1px solid {T2}; color: {INK}; font-size: 14px; font-weight: 600; text-decoration: none">{ic('mail', 18, 1.800, P)}Use my email instead</a>
    <div style="display: flex; gap: 10px; padding: 12px; border-radius: 10px; background: {T4}; color: {MUTE}; font-size: 12px; line-height: 18px">{ic('shield', 18, 2, P)}<span>SMS not arriving? Enter your email address and we send the 6-digit code there. We ask for your mobile number at your first order, for delivery updates.</span></div>
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
    <div style="display: flex; gap: 10px; padding: 12px; border-radius: 10px; background: {T4}; font-size: 12px; line-height: 18px; color: {MUTE}">{ic('receipt', 16, 2, P)}<span>Your tax invoice will be in Orders once the parcel ships. Updates come by SMS and in the app.</span></div>
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
  </div>''' + nav(''), PAGE))

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
SIDE = [('chart', 'Dashboard', 'AdminDashboard'), ('box', 'Products', 'AdminProducts'), ('layout', 'Categories', 'AdminCategories'), ('download', 'Stock', 'AdminInventory'),
        ('receipt', 'Orders', 'AdminOrders'), ('undo', 'Returns', 'AdminReturns'), ('users', 'Customers', 'AdminCustomers'), ('image', 'App content', 'AdminContent'),
        ('spark', 'AI try-on', 'AdminAI'), ('tag', 'Offers', 'AdminOffers'), ('gear', 'Settings', 'AdminSettings')]


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
        {btn('Continue')}""")}
      {loginpanel('STEP 2 · ONE-TIME CODE', f"""<h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800">Enter the code</h1>
        <p style="margin: 0; font-size: 13px; line-height: 20px; color: {MUTE}">Sent to <strong style="color: {INK}; font-weight: 600">ow•••@alar.example</strong> and by SMS to the number ending 345. Needed on every sign-in.</p>
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
        crow('Divya Raman', '+91 99620 44110', 'Email code', '1', '₹3,400', '6', 'V3 AGREED', 'green', 'ACTIVE', 'green'),
        crow('Meena Krishnan', '+91 94440 78021', 'Mobile OTP', '2', '₹5,500', '0', 'NOT ASKED', 'grey', 'ACTIVE', 'green'),
        crow('Sangeetha Vel', '+91 90030 65512', 'Email code', '0', '₹0', '9', 'V2 · ASK AGAIN', 'amber', 'ACTIVE', 'green'),
        crow('Kavitha Suresh', '+91 98840 20934', 'Mobile OTP', '4', '₹14,900', '22', 'WITHDRAWN', 'grey', 'ACTIVE', 'green'),
        crow('Revathi Mohan', '+91 97910 33487', 'Mobile OTP', '1', '₹6,300', '3', 'V3 AGREED', 'green', 'BLOCKED', 'red')],
        ['1.800fr', '1.300fr', '1.100fr', '0.600fr', '0.800fr', '0.600fr', '1.200fr', '0.800fr'])}
      <span style="font-size: 12px; color: {MUTE}">Try-on photos are never shown here. Staff see only counts and the consent record.</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px">
      {acard(h2('Staff and roles', 14) + ''.join(f'<div style="display: flex; align-items: center; gap: 10px"><span style="width: 32px; height: 32px; border-radius: 999px; background: {T1}; color: {PD}; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">{i}</span><span style="flex: 1; display: flex; flex-direction: column; font-size: 13px; line-height: 18px">{bold(n)}<span style="font-size: 12px; color: {MUTE}">{d}</span></span>{chip(r, tone=t)}</div>' for i, n, d, r, t in [('AR', 'Arun', 'Everything', 'OWNER', 'lav'), ('SK', 'Saranya K.', 'Products, stock, content', 'CATALOGUE', 'grey'), ('MV', 'Murugan V.', 'Orders, returns, labels', 'PACKING', 'grey')]) + f'<span style="font-size: 12px; line-height: 18px; color: {MUTE}">Staff sign in with a password, then a one-time code. Only the owner can change AI settings, prices and roles.</span>', gap=10)}
      {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Deletion request", 14)}{chip("DUE IN 5 DAYS", tone="amber")}</div><span style="font-size: 13px; line-height: 20px">Sangeetha Vel asked to delete her account and try-on photos on 25 Nov.</span><span style="font-size: 12px; line-height: 18px; color: {MUTE}">Invoices are kept as the tax law requires; everything else is erased.</span><div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{abtn("View record")}{abtn("Erase now", "primary")}</div>', gap=10)}
    </div>
  </div>'''))

# ================================================================== BATCH 3: remaining shopper, web and admin screens
B.update(c_silk='ffb3625dfed5ea5fc5c7788b667bf42e', c_cotton='9a328687a71646d20a464df692b6734b', c_wedding='e0580f650ed0d55b0f87622656b15946',
         c_festive='cb04510b38a85031edc1ead5f9db4631', c_newin='c9689231ca6b9fbf6e7dce69f5e6e74a', c_under='2f4bea15f6858c6a5d7f1d69490b5729',
         c_shirts='85d092fb33eeae4b036a7fbdeb8da23d', c_dhotis='cfc24db4dcc295e18f7bcf81cfa9429c')
ICON.update(
    grid='<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    clock='<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/>',
    star='<path d="M12 3l2.700 5.800 6.300.800-4.600 4.300 1.200 6.200L12 17l-5.600 3.100 1.200-6.200L3 9.600l6.300-.800z"/>',
    user='<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    chat='<path d="M4 5h16v11H9l-5 4z"/>', call='<path d="M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A15 15 0 014 5a1 1 0 011-1z"/>',
    globe='<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.500 3 14.500 0 18M12 3c-3 3.500-3 14.500 0 18"/>',
    card='<rect x="3" y="5" width="18" height="14" rx="2.500"/><path d="M3 10h18"/>',
    logout='<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>', wifi='<path d="M3 9a14 14 0 0118 0M6 12.500a9.500 9.500 0 0112 0M9 16a5 5 0 016 0M12 19.500v.100"/>',
    alert='<path d="M12 4l9 16H3z"/><path d="M12 10v4.500M12 17.500v.100"/>', edit='<path d="M4 20h4L19 9l-4-4L4 16z"/>',
)
SEP = f'<span style="height: 1px; background: {LINE}"></span>'


def check(t, on=False, count=''):
    box = f'<span style="width: 18px; height: 18px; border-radius: 5px; box-sizing: border-box; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; color: #FFFFFF; ' + (f'background: {P}">' + ic('check', 12, 3.500) if on else f'border: 1.500px solid #B9B4CC">') + '</span>'
    cnt = f'<span style="margin-left: auto; font-size: 12px; color: {MUTE}">{count}</span>' if count else ''
    return f'<span style="display: flex; align-items: center; gap: 10px; min-height: 40px; font-size: 14px; line-height: 20px; font-weight: {600 if on else 400}">{box}{t}{cnt}</span>'


def radiorow(t, on=False, sub=''):
    s = f'<span style="font-size: 12px; line-height: 16px; color: {MUTE}">{sub}</span>' if sub else ''
    return f'<span style="display: flex; align-items: center; gap: 10px; min-height: 44px; font-size: 14px; line-height: 20px">{radio(on)}<span style="display: flex; flex-direction: column"><span style="font-weight: {600 if on else 400}">{t}</span>{s}</span></span>'


def tog(t, on=True, sub=''):
    s = f'<span style="font-size: 12px; line-height: 16px; color: {MUTE}">{sub}</span>' if sub else ''
    return f'<div style="display: flex; align-items: center; gap: 12px; min-height: 44px"><span style="flex: 1; display: flex; flex-direction: column; font-size: 14px; line-height: 20px"><span>{t}</span>{s}</span>{toggle(on)}</div>'


def note(i, t, tone='lav'):
    bg, c = {'lav': (T4, P), 'amber': ('#FFF1DC', AMBER), 'red': ('#FCE8E6', RED), 'green': ('#E3F4EC', GREEN)}[tone]
    return f'<div style="display: flex; gap: 10px; padding: 10px 12px; border-radius: 10px; background: {bg}; font-size: 12px; line-height: 18px; color: {MUTE if tone == "lav" else INK}">{ic(i, 16, 2, c)}<span>{t}</span></div>'


def stars(n, s=14):
    return '<span style="display: inline-flex; gap: 2px">' + ''.join(f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="{"#F2A90D" if i < n else "#E3E0EE"}" aria-hidden="true">{ICON["star"]}</svg>' for i in range(5)) + '</span>'


def pcard(k, name, sub, price, mrp, off, h=210, extra='', badge=''):
    bdg = f'<span style="position: absolute; left: 0; top: 10px; height: 22px; padding: 0 10px 0 8px; display: inline-flex; align-items: center; background: {P}; color: #FFFFFF; font-size: 11px; font-weight: 600; border-radius: 0 6px 6px 0">{badge}</span>' if badge else ''
    return f'''<div style="display: flex; flex-direction: column; gap: 8px; min-width: 0"><div style="height: {h}px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}">{img(k)}{bdg}<span style="position: absolute; right: 8px; top: 8px; width: 32px; height: 32px; border-radius: 999px; background: #FFFFFF; border: 1px solid {LINE}; display: inline-flex; align-items: center; justify-content: center; color: {P}">{ic('heart', 16, 2)}</span></div>
      <div style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 13px; line-height: 18px; font-weight: 700">{name}</span><span style="font-size: 12px; line-height: 16px; color: {MUTE}">{sub}</span><span style="display: flex; align-items: center; gap: 6px"><span style="{HF}; font-size: 14px; font-weight: 800">{price}</span><span style="font-size: 12px; color: {MUTE}; text-decoration: line-through">{mrp}</span><span style="font-size: 12px; font-weight: 700; color: {PD}">{off}</span></span></div>{extra}</div>'''


# ------------------------------------------------------------------ Categories tab
def rail(t, i, on=False):
    st = f'background: #FFFFFF; color: {PD}; font-weight: 700; border-left: 3px solid {P}' if on else f'color: {INK}; font-weight: 500; border-left: 3px solid transparent'
    return f'<span style="height: 68px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 11px; {st}">{ic(i, 20, 1.800)}{t}</span>'


def ctile(k, t, soon=False):
    s = f'<span style="position: absolute; left: 4px; top: 4px; height: 16px; padding: 0 5px; border-radius: 4px; background: {INK}; color: #FFFFFF; font-size: 9px; font-weight: 700; display: inline-flex; align-items: center">SOON</span>' if soon else ''
    return f'<span style="display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11px; line-height: 14px; text-align: center"><span style="width: 76px; height: 92px; border-radius: 16px; overflow: hidden; position: relative; background: {T1}; display: block">{img(k, "center")}{s}</span>{t}</span>'


boards['Categories'] = ('Alar categories', 390, 844, phone(844, hdr('Categories', 'Main.dc.html', ic('search', 20, 2, INK)) + f'''
  <div style="flex: 1; min-height: 0; display: flex">
    <div style="width: 84px; flex-shrink: 0; background: {T4}; display: flex; flex-direction: column">{rail('Sarees', 'grid', True)}{rail('New in', 'star')}{rail('Offers', 'tag')}{rail('Try-on', 'spark')}</div>
    <div style="flex: 1; min-width: 0; padding: 16px 12px; display: flex; flex-direction: column; gap: 14px">
      <div style="display: flex; align-items: center; justify-content: space-between">{h2('Sarees', 14)}<a href="Listing.dc.html" style="font-size: 13px; font-weight: 600; text-decoration: none">View all</a></div>
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 8px">{ctile('c_silk', 'Silk')}{ctile('c_cotton', 'Cotton')}{ctile('c_wedding', 'Wedding')}{ctile('c_festive', 'Festive')}{ctile('c_newin', 'New in')}{ctile('c_under', 'Under ₹2,500')}</div>
      {SEP}{h2('Shop by occasion', 14)}
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 8px">{ctile('c_wedding', 'Wedding')}{ctile('c_festive', 'Festive')}{ctile('c_cotton', 'Daily wear')}</div>
    </div>
  </div>''' + nav('Categories')))

# ------------------------------------------------------------------ Search
def srow(i, t, sub=''):
    s = f'<span style="font-size: 12px; color: {MUTE}">{sub}</span>' if sub else ''
    return f'<span style="display: flex; align-items: center; gap: 12px; min-height: 44px; font-size: 14px">{ic(i, 18, 2, MUTE)}<span style="flex: 1; display: flex; flex-direction: column">{t}{s}</span><span style="transform: rotate(-45deg); display: inline-flex; color: {MUTE}">{ic("back", 16, 2)}</span></span>'


def sprod(k, t, p):
    return f'<span style="display: flex; align-items: center; gap: 12px">{pic(k, 44, 55, 8)}<span style="flex: 1; display: flex; flex-direction: column; font-size: 13px; line-height: 18px"><strong style="font-weight: 600">{t}</strong><span style="color: {MUTE}">{p}</span></span>{ic("right", 16, 2.200, MUTE)}</span>'


boards['Search'] = ('Alar search', 390, 844, phone(844, f'''
  <header style="height: 56px; box-sizing: border-box; padding: 0 16px 0 4px; display: flex; align-items: center; gap: 4px; flex-shrink: 0; border-bottom: 1px solid {LINE}">
    <a href="Main.dc.html" aria-label="Back" style="width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; color: {INK}">{ic('back', 24)}</a>
    <span style="flex: 1; display: flex; align-items: center; gap: 8px; height: 40px; box-sizing: border-box; padding: 0 12px; border-radius: 10px; border: 1.500px solid {P}; font-size: 14px">kanchi<span style="width: 1.500px; height: 18px; background: {P}"></span><span style="margin-left: auto; color: {MUTE}">{ic('close', 16, 2.200)}</span></span>
  </header>
  <div style="padding: 8px 16px 0; display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; flex-direction: column">{srow('search', '<span><strong style="font-weight: 700">kanchi</strong>puram silk sarees</span>', 'in Sarees')}{srow('search', '<span><strong style="font-weight: 700">kanchi</strong>puram wedding sarees</span>')}{srow('search', '<span><strong style="font-weight: 700">kanchi</strong> cotton sarees</span>')}{srow('clock', '<span><strong style="font-weight: 700">kanchi</strong>puram violet</span>', 'You searched this before')}</div>
    {SEP}{h2('Products', 14)}
    {sprod('violet', 'Kanchipuram silk saree, violet', '₹4,800')}{sprod('emerald', 'Kanchipuram silk saree, emerald', '₹4,950')}
    {SEP}{h2('Trending now', 14)}
    <div style="display: flex; flex-wrap: wrap; gap: 8px">{chip('Wedding silks')}{chip('Under ₹2,500')}{chip('Soft silk')}{chip('Kasavu')}{chip('Temple border')}{chip('Try-on ready')}</div>
  </div>'''))

# ------------------------------------------------------------------ Filters
def frail(t, on=False, n=''):
    st = f'background: #FFFFFF; font-weight: 700; color: {INK}' if on else f'font-weight: 500; color: {INK}'
    dot = f'<span style="min-width: 16px; height: 16px; border-radius: 999px; background: {P}; color: #FFFFFF; font-size: 10px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">{n}</span>' if n else ''
    return f'<span style="height: 48px; padding: 0 12px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; {st}">{t}{dot}</span>'


boards['Filters'] = ('Alar filters', 390, 844, phone(844, f'''
  <header style="height: 56px; box-sizing: border-box; padding: 0 16px 0 4px; display: flex; align-items: center; gap: 4px; flex-shrink: 0; border-bottom: 1px solid {LINE}"><a href="Listing.dc.html" aria-label="Close" style="width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; color: {INK}">{ic('close', 22)}</a><span style="flex: 1; {HF}; font-size: 16px; font-weight: 700">Filters</span><a href="#clear" style="font-size: 13px; font-weight: 600; text-decoration: none">Clear all</a></header>
  <div style="flex: 1; min-height: 0; display: flex">
    <div style="width: 128px; flex-shrink: 0; background: {T4}; display: flex; flex-direction: column">{frail('Fabric', True, '2')}{frail('Colour', n='1')}{frail('Price')}{frail('Weave')}{frail('Occasion')}{frail('Border')}{frail('Discount')}{frail('Delivery time')}{frail('Try-on ready')}</div>
    <div style="flex: 1; min-width: 0; padding: 8px 16px; display: flex; flex-direction: column">
      <span style="display: flex; align-items: center; gap: 8px; height: 36px; padding: 0 10px; margin: 4px 0 8px; border-radius: 8px; border: 1px solid {T2}; font-size: 13px; color: #9B97AD">{ic('search', 14, 2, MUTE)}Search fabric</span>
      {check('Pure silk', True, '42')}{check('Soft silk', True, '31')}{check('Cotton', False, '28')}{check('Silk cotton', False, '14')}{check('Tussar', False, '8')}{check('Linen', False, '5')}
    </div>
  </div>''' + bar(f'<span style="display: flex; flex-direction: column"><span style="{HF}; font-size: 16px; font-weight: 800">73 items</span><span style="font-size: 12px; color: {MUTE}">3 filters on</span></span>' + btn('Apply', href='Listing.dc.html'), 'minmax(0, 1fr) 180px')))

# ------------------------------------------------------------------ Wishlist
def move(t='Move to bag', off=False):
    st = f'background: #F6F5FA; color: {MUTE}; border: 1px solid {LINE}' if off else f'background: #FFFFFF; color: {PD}; border: 1.500px solid {P}'
    return f'<span style="height: 32px; border-radius: 8px; {st}; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700">{t}</span>'


boards['Wishlist'] = ('Alar wishlist', 390, 1010, phone(1010, hdr('Wishlist', 'Main.dc.html', f'<span style="font-size: 13px; color: {MUTE}">4 items</span>') + f'''
  <div style="padding: 12px 16px 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 12px">
    {pcard('violet', 'Kanchipuram silk saree', 'Violet', '₹4,800', '₹5,400', '11% OFF', 210, move())}
    {pcard('emerald', 'Kanchipuram silk saree', 'Emerald', '₹4,950', '₹5,500', '10% OFF', 210, move())}
    {pcard('mustard', 'Chettinad cotton saree', 'Mustard', '₹1,650', '₹1,900', '13% OFF', 210, move())}
    {pcard('navy', 'Banarasi silk saree', 'Navy', '₹4,950', '₹5,600', '11% OFF', 210, move('Sold out', True))}
  </div>''' + nav('')))

# ------------------------------------------------------------------ Try-on waiting / problem / hub
def wstep(t, state):
    if state == 'done':
        d = f'<span style="width: 20px; height: 20px; border-radius: 999px; background: {P}; color: #FFFFFF; display: inline-flex; align-items: center; justify-content: center">{ic("check", 12, 3.500)}</span>'
    elif state == 'on':
        d = f'<span style="width: 20px; height: 20px; border-radius: 999px; border: 2.500px solid {T2}; border-top-color: {P}; box-sizing: border-box"></span>'
    else:
        d = f'<span style="width: 20px; height: 20px; border-radius: 999px; border: 2px solid {T2}; box-sizing: border-box"></span>'
    return f'<span style="display: flex; align-items: center; gap: 12px; min-height: 36px; font-size: 14px; font-weight: {600 if state != "todo" else 400}; color: {INK if state != "todo" else MUTE}">{d}{t}</span>'


boards['TryOnWait'] = ('Alar try-on in progress', 390, 844, phone(844, hdr('Making your try-on', 'TryOnPhoto.dc.html') + f'''
  <div style="padding: 20px 16px 0; display: flex; flex-direction: column; gap: 16px; align-items: center">
    <div style="display: flex; align-items: center; gap: 12px"><span style="width: 120px; height: 160px; border-radius: 16px; overflow: hidden; position: relative; background: {GROUND}; display: block">{img('tryon', '80% center')}</span><span style="width: 32px; height: 32px; border-radius: 999px; background: {T1}; color: {P}; display: inline-flex; align-items: center; justify-content: center">{ic('plus', 16, 2.400)}</span><span style="width: 120px; height: 160px; border-radius: 16px; overflow: hidden; position: relative; background: {GROUND}; display: block">{img('maroon')}</span></div>
    <div style="width: 100%; display: flex; flex-direction: column; gap: 6px"><div style="height: 6px; border-radius: 999px; background: {T1}; overflow: hidden"><span style="display: block; width: 58%; height: 100%; border-radius: 999px; background: {P}"></span></div><div style="display: flex; justify-content: space-between; font-size: 12px; color: {MUTE}"><span>About 15 seconds</span><span>58%</span></div></div>
    {card(wstep('Photo checked', 'done') + wstep('Draping the saree on you', 'on') + wstep('Final quality check', 'todo'), 12, 0, 'width: 100%; box-sizing: border-box')}
    <div style="width: 100%">{note('bell', 'You can keep browsing. We will tell you the moment it is ready, and it will be saved under Try-on.')}</div>
  </div>
  <div style="margin-top: auto; padding: 12px 16px 20px; display: flex; flex-direction: column; gap: 8px">{btn('Keep browsing', 'ghost', href='Listing.dc.html')}<a href="TryOnPhoto.dc.html" style="display: inline-flex; align-items: center; justify-content: center; height: 40px; font-size: 14px; font-weight: 600; color: {MUTE}; text-decoration: none">Cancel</a></div>'''))

boards['TryOnProblem'] = ('Alar try-on problem', 390, 844, phone(844, hdr('Your try-on', 'TryOnPhoto.dc.html') + f'''
  <div style="padding: 32px 16px 0; display: flex; flex-direction: column; gap: 16px; align-items: center; text-align: center">
    <span style="width: 64px; height: 64px; border-radius: 999px; background: #FFF1DC; color: {AMBER}; display: inline-flex; align-items: center; justify-content: center">{ic('image', 30, 1.800)}</span>
    <h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800">We could not use this photo</h1>
    <p style="margin: 0; font-size: 14px; line-height: 22px; color: {MUTE}">We can see more than one person. Please choose a photo with only you in it.</p>
    <div style="width: 100%; text-align: left">{card(h2('A good photo has', 14) + f'<div style="display: flex; flex-direction: column; gap: 8px">{tip("You alone, standing")}{tip("Head to feet in the frame")}{tip("Bright, even light")}</div>', 12, 10)}</div>
    <div style="width: 100%; text-align: left">{note('check', 'This attempt is not counted. You still have 5 free try-ons today.', 'green')}</div>
  </div>
  <div style="margin-top: auto; padding: 12px 16px 20px; display: flex; flex-direction: column; gap: 8px">{btn('Choose another photo', href='TryOnPhoto.dc.html', icon='image')}{btn('Back to the saree', 'ghost', href='Product.dc.html')}</div>'''))


def tr(k, t):
    return f'<span style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; line-height: 14px; color: {MUTE}"><span style="height: 136px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; display: block">{img(k)}<span style="position: absolute; left: 4px; top: 4px; height: 16px; padding: 0 5px; border-radius: 4px; background: {P}; color: #FFFFFF; font-size: 9px; font-weight: 700; display: inline-flex; align-items: center">AI</span></span>{t}</span>'


boards['TryOnHub'] = ('Alar try-on tab', 390, 1010, phone(1010, hdr('Try-on', 'Main.dc.html', f'<span style="font-size: 12px; font-weight: 600; color: {PD}; height: 28px; padding: 0 10px; border-radius: 999px; background: {T1}; display: inline-flex; align-items: center">3 of 5 left today</span>') + f'''
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; gap: 12px; padding: 12px; border-radius: 16px; background: {T1}; align-items: center">{pic('tryon', 72, 96, 10, '80% center')}<div style="flex: 1; display: flex; flex-direction: column; gap: 6px"><strong style="{HF}; font-size: 16px; line-height: 22px; font-weight: 800">See any saree on you</strong><span style="font-size: 12px; line-height: 18px; color: {MUTE}">Your photo is saved. Pick a saree and tap Try it on.</span>{btn('Pick a saree', href='Listing.dc.html', h=32, extra='font-size: 13px; align-self: flex-start')}</div></div>
    <div style="display: flex; flex-direction: column; gap: 10px"><div style="display: flex; align-items: center; justify-content: space-between">{h2('My try-ons', 14)}<span style="font-size: 12px; color: {MUTE}">6 saved</span></div>
      <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px 8px">{tr('maroon', 'Arani silk')}{tr('violet', 'Kanchipuram')}{tr('emerald', 'Kanchipuram')}{tr('peacock', 'Soft silk')}{tr('mustard', 'Chettinad')}{tr('navy', 'Banarasi')}</div></div>
    {card(f'<div style="display: flex; gap: 12px; align-items: center">{pic("tryon", 48, 64, 8, "80% center")}<span style="flex: 1; display: flex; flex-direction: column; font-size: 13px; line-height: 18px"><strong style="font-weight: 700">My photo</strong><span style="color: {MUTE}">Deleted by itself in 26 days if not used</span></span></div><div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{sbtn("Change photo")}{sbtn("Delete photo")}</div>', 12, 10)}
    <a href="Privacy.dc.html" style="font-size: 13px; font-weight: 600; text-decoration: none">How my photo is used, and how to withdraw</a>
  </div>''' + nav('Try-on'), PAGE))

# ------------------------------------------------------------------ Empty bag / payment failed
boards['EmptyBag'] = ('Alar empty bag', 390, 844, phone(844, hdr('Bag', 'Main.dc.html') + f'''
  <div style="padding: 40px 16px 0; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center">
    <span style="width: 72px; height: 72px; border-radius: 999px; background: {T1}; color: {P}; display: inline-flex; align-items: center; justify-content: center">{ic('bag', 32, 1.600)}</span>
    <h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800">Your bag is empty</h1>
    <p style="margin: 0; font-size: 14px; line-height: 22px; color: {MUTE}">Sarees you add will wait here.</p>
    {btn('Start shopping', href='Main.dc.html', extra='width: 200px')}
  </div>
  <div style="padding: 32px 16px 0; display: flex; flex-direction: column; gap: 10px"><div style="display: flex; align-items: center; justify-content: space-between">{h2('From your wishlist', 14)}<a href="Wishlist.dc.html" style="font-size: 13px; font-weight: 600; text-decoration: none">View all</a></div>
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">''' + ''.join(f'<span style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 700"><span style="height: 140px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; display: block">{img(k)}</span>{p}</span>' for k, p in [('violet', '₹4,800'), ('emerald', '₹4,950'), ('mustard', '₹1,650')]) + '''</div></div>''' + nav('Bag')))

boards['PaymentFailed'] = ('Alar payment failed', 390, 844, phone(844, hdr('Payment', 'Checkout.dc.html') + f'''
  <div style="padding: 32px 16px 0; display: flex; flex-direction: column; gap: 12px; align-items: center; text-align: center">
    <span style="width: 64px; height: 64px; border-radius: 999px; background: #FCE8E6; color: {RED}; display: inline-flex; align-items: center; justify-content: center">{ic('alert', 30, 1.800)}</span>
    <h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800">Payment did not go through</h1>
    <p style="margin: 0; font-size: 14px; line-height: 22px; color: {MUTE}">Your UPI app did not confirm the payment. No order has been placed.</p>
  </div>
  <div style="padding: 20px 16px 0; display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: 1.500px solid {P}; background: {T4}">{ic('clock', 20, 2, P)}<span style="flex: 1; font-size: 13px; line-height: 18px"><strong style="font-weight: 700">Your sarees are held for you</strong><br><span style="color: {MUTE}">Pay within the time left to keep them.</span></span><strong style="{HF}; font-size: 18px; font-weight: 800; color: {PD}">11:42</strong></div>
    {card(f'<div style="display: flex; align-items: center; gap: 8px">{pic("maroon", 40, 50, 8)}{pic("ivory", 40, 50, 8)}<span style="flex: 1; font-size: 13px; color: {MUTE}; padding-left: 4px">2 items</span><strong style="{HF}; font-size: 15px; font-weight: 800">₹4,950</strong></div>', 12)}
    {note('shield', 'If money left your account, the bank returns it by itself in 5 to 7 working days. You do not need to do anything.')}
  </div>
  <div style="margin-top: auto; padding: 12px 16px 20px; display: flex; flex-direction: column; gap: 8px">{btn('Try again', href='Checkout.dc.html')}{btn('Pay another way', 'ghost', href='Checkout.dc.html')}<a href="Help.dc.html" style="display: inline-flex; align-items: center; justify-content: center; height: 36px; font-size: 13px; font-weight: 600; text-decoration: none">Need help?</a></div>'''))

# ------------------------------------------------------------------ Profile
def qtile(i, t, href):
    return f'<a href="{href}" style="height: 64px; border-radius: 12px; border: 1px solid {LINE}; background: #FFFFFF; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-size: 12px; font-weight: 600; color: {INK}; text-decoration: none">{ic(i, 20, 1.800, P)}{t}</a>'


def lrow(i, t, href='#', sub='', color=INK):
    s = f'<span style="font-size: 12px; line-height: 16px; color: {MUTE}; font-weight: 400">{sub}</span>' if sub else ''
    return f'<a href="{href}" style="display: flex; align-items: center; gap: 12px; min-height: 48px; color: {color}; font-size: 14px; font-weight: 600; text-decoration: none">{ic(i, 18, 2, P if color == INK else color)}<span style="flex: 1; display: flex; flex-direction: column">{t}{s}</span>{ic("right", 16, 2.200, MUTE)}</a>'


boards['Profile'] = ('Alar profile', 390, 1010, phone(1010, f'''
  <div style="background: linear-gradient(180deg, {T1} 0%, {PAGE} 100%); padding: 8px 16px 16px; display: flex; flex-direction: column; gap: 12px">
    <div style="height: 44px; display: flex; align-items: center; justify-content: space-between; margin-left: -12px"><a href="Main.dc.html" aria-label="Back" style="width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; color: {INK}">{ic('back', 24)}</a><a href="Notifications.dc.html" aria-label="Notifications" style="color: {INK}">{ic('bell', 22, 1.800)}</a></div>
    <div style="display: flex; align-items: center; gap: 12px"><span style="width: 56px; height: 56px; border-radius: 999px; background: {P}; color: #FFFFFF; {HF}; font-size: 20px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center">LN</span><span style="flex: 1; display: flex; flex-direction: column"><strong style="{HF}; font-size: 18px; line-height: 24px; font-weight: 800">Lakshmi Narayanan</strong><span style="font-size: 13px; color: {MUTE}">+91 98400 12345</span></span><span style="height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid {T2}; background: #FFFFFF; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center">Edit</span></div>
    <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px">{qtile('box', 'Orders', 'Orders.dc.html')}{qtile('heart', 'Wishlist', 'Wishlist.dc.html')}{qtile('spark', 'Try-ons', 'TryOnHub.dc.html')}{qtile('help', 'Help', 'Help.dc.html')}</div>
  </div>
  <div style="padding: 0 16px; display: flex; flex-direction: column; gap: 12px">
    {card(lrow('pin', 'Addresses', 'Addresses.dc.html', '2 saved') + SEP + lrow('card', 'Payments and refunds', sub='1 refund on the way') + SEP + lrow('tag', 'Coupons', sub='2 you can use'), 16, 0, 'padding-top: 4px; padding-bottom: 4px')}
    {card(lrow('bell', 'Notifications', 'Notifications.dc.html') + SEP + lrow('globe', 'Language', sub='English · தமிழ் · తెలుగు · ಕನ್ನಡ · മലയാളം') + SEP + lrow('shield', 'Privacy and consent', 'Privacy.dc.html', 'Try-on photo, data, account'), 16, 0, 'padding-top: 4px; padding-bottom: 4px')}
    {card(lrow('receipt', 'Terms, returns and shipping policy') + SEP + lrow('chat', 'Grievance officer') + SEP + lrow('logout', 'Log out', color=RED), 16, 0, 'padding-top: 4px; padding-bottom: 4px')}
    <span style="font-size: 12px; color: {MUTE}; text-align: center">Alar app 1.0.0</span>
  </div>''', PAGE))

# ------------------------------------------------------------------ Addresses
def addr(name, tag, lines, on=False):
    bd = f'1.500px solid {P}' if on else f'1px solid {LINE}'
    return f'<div style="background: #FFFFFF; border: {bd}; border-radius: 16px; padding: 12px; display: flex; gap: 12px">{radio(on)}<div style="flex: 1; display: flex; flex-direction: column; gap: 8px"><div style="display: flex; flex-direction: column; gap: 2px; font-size: 13px; line-height: 20px"><span><strong style="font-weight: 700">{name}</strong> {chip(tag, tone="lav")}{" " + chip("DEFAULT", tone="grey") if on else ""}</span><span style="color: {MUTE}">{lines}</span></div><div style="display: flex; gap: 8px">{sbtn("Edit")}{sbtn("Remove")}</div></div></div>'


boards['Addresses'] = ('Alar addresses', 390, 844, phone(844, hdr('Addresses', 'Profile.dc.html') + f'''
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {addr('Lakshmi Narayanan', 'HOME', '14, 2nd Cross Street, Mandaveli, Chennai, Tamil Nadu 600028<br>+91 98400 12345', True)}
    {addr('Lakshmi Narayanan', 'WORK', '3rd Floor, Prestige Polygon, Anna Salai, Chennai, Tamil Nadu 600035<br>+91 98400 12345')}
    {note('truck', 'We deliver across Tamil Nadu, Kerala, Karnataka, Andhra Pradesh, Telangana and Puducherry. More states are coming.')}
  </div>''' + bar(btn('Add a new address', href='AddAddress.dc.html', icon='plus'), '1fr'), PAGE))

boards['AddAddress'] = ('Alar add address', 390, 1010, phone(1010, hdr('Add address', 'Addresses.dc.html') + f'''
  <div style="padding: 16px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {field('Full name', 'Lakshmi Narayanan')}{field('Mobile number', '98400 12345', pre='+91')}
    <div style="display: flex; gap: 12px; align-items: flex-end">{field('PIN code', '600028', w='140px')}<span style="flex: 1; height: 44px; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: {GREEN}">{ic('check', 16, 2.600)}We deliver here by Tue, 1 Dec</span></div>
    {field('House, flat or building', '14, 2nd Cross Street')}{field('Area or street', 'Mandaveli')}{field('Landmark (optional)', ph='Near the temple tank')}
    <div style="display: flex; gap: 12px">{field('City', 'Chennai')}{field('State', 'Tamil Nadu')}</div>
    <div style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 13px; font-weight: 600">Save as</span><div style="display: flex; gap: 8px">{chip('Home', True)}{chip('Work')}{chip('Other')}</div></div>
    {check('Make this my default address', True)}
  </div>''' + bar(btn('Save address', href='Addresses.dc.html'), '1fr')))

# ------------------------------------------------------------------ Notifications
def nrow(i, t, s, when, unread=False):
    dot = f'<span style="width: 8px; height: 8px; border-radius: 999px; background: {P}; flex-shrink: 0"></span>' if unread else ''
    return f'<div style="display: flex; gap: 12px; padding: 12px 16px; background: {T4 if unread else "#FFFFFF"}; border-bottom: 1px solid {LINE}"><span style="width: 40px; height: 40px; border-radius: 12px; background: {T1}; color: {P}; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0">{ic(i, 20, 1.800)}</span><span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px; line-height: 20px; font-weight: {700 if unread else 600}">{t}</strong><span style="font-size: 13px; line-height: 18px; color: {MUTE}">{s}</span><span style="font-size: 11px; color: {MUTE}">{when}</span></span>{dot}</div>'


boards['Notifications'] = ('Alar notifications', 390, 844, phone(844, hdr('Notifications', 'Profile.dc.html', f'<a href="#read" style="font-size: 13px; font-weight: 600; text-decoration: none">Mark all read</a>') + f'''
  <div style="display: flex; gap: 8px; padding: 12px 16px; border-bottom: 1px solid {LINE}">{chip('All', True)}{chip('Orders')}{chip('Try-on')}{chip('Offers')}</div>
  {nrow('truck', 'Your order has shipped', 'AL-2611-00418 is on the way. Arrives by Tue, 1 Dec.', '2 hours ago', True)}
  {nrow('spark', 'Your try-on is ready', 'See the Arani silk saree on you.', 'Yesterday, 6:31 pm', True)}
  {nrow('undo', 'Refund sent', '₹2,400 for AL-2610-00193 has gone back to your UPI account.', '2 Nov')}
  {nrow('shield', 'We updated the try-on notice', 'Please read and agree again before your next try-on.', '20 Nov')}'''))

# ------------------------------------------------------------------ Privacy and consent
boards['Privacy'] = ('Alar privacy and consent', 390, 1100, phone(1100, hdr('Privacy and consent', 'Profile.dc.html') + f'''
  <div style="padding: 12px 16px 24px; display: flex; flex-direction: column; gap: 12px">
    {card(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Try-on consent", 14)}{chip("AGREED · VERSION 3", tone="green")}</div><span style="font-size: 13px; line-height: 20px; color: {MUTE}">You agreed on 26 Nov 2026 that your photo may be sent to the AI services named in the notice to make try-on pictures.</span><div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{sbtn("Read the notice")}{sbtn("Withdraw consent")}</div><span style="font-size: 12px; line-height: 18px; color: {MUTE}">Withdrawing deletes your photo and try-on pictures at once. Shopping works as before.</span>', 12, 10)}
    {card(h2('My try-on data', 14) + row('Photo stored', '1') + row('Try-on pictures saved', '6') + row('Deleted by itself', 'After 30 days without use') + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{sbtn("Delete pictures")}{sbtn("Delete everything")}</div>', 12, 8)}
    {card(h2('Messages from Alar', 14) + tog('Order updates in the app', True) + SEP + tog('Order updates by SMS', True, 'Needed for delivery; cannot be turned off') + SEP + tog('Offers and new arrivals', False), 12, 0)}
    {card(lrow('download', 'Get a copy of my data', sub='Sent to your email within 7 days') + SEP + lrow('edit', 'Correct my details') + SEP + lrow('chat', 'Complain to the grievance officer', sub='Reply within 48 hours'), 16, 0, 'padding-top: 4px; padding-bottom: 4px')}
    <div style="border: 1px solid #F3C7C3; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px; background: #FFFFFF"><strong style="font-size: 14px; font-weight: 700; color: {RED}">Delete my account</strong><span style="font-size: 12px; line-height: 18px; color: {MUTE}">Removes your profile, addresses, wishlist and try-on data. Invoices are kept for the time tax law requires.</span><span style="height: 36px; border-radius: 8px; border: 1.500px solid {RED}; color: {RED}; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">Start account deletion</span></div>
  </div>''', PAGE))

# ------------------------------------------------------------------ Help
boards['Help'] = ('Alar help', 390, 844, phone(844, hdr('Help', 'Profile.dc.html') + f'''
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {card(f'<span style="font-size: 12px; color: {MUTE}">Is it about this order?</span><div style="display: flex; gap: 12px; align-items: center">{pic("maroon", 44, 55, 8)}<span style="flex: 1; display: flex; flex-direction: column; font-size: 13px; line-height: 18px"><strong style="font-weight: 700">AL-2611-00418 · On the way</strong><span style="color: {MUTE}">Arrives by Tue, 1 Dec</span></span>{ic("right", 16, 2.200, MUTE)}</div>', 12, 8)}
    {card(lrow('truck', 'Where is my order?') + SEP + lrow('undo', 'Return, exchange or refund') + SEP + lrow('card', 'Payment problem') + SEP + lrow('spark', 'Try-on and my photo') + SEP + lrow('user', 'Account and login'), 16, 0, 'padding-top: 4px; padding-bottom: 4px')}
    {h2('Talk to us', 14)}
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">{qtile('chat', 'Chat', '#chat')}{qtile('call', 'Call', '#call')}{qtile('mail', 'Email', '#mail')}</div>
    <span style="font-size: 12px; line-height: 18px; color: {MUTE}">Monday to Saturday, 10 am to 6 pm. We answer in English, Tamil, Telugu, Kannada and Malayalam.</span>
  </div>''', PAGE))

# ------------------------------------------------------------------ Returns
def seg(a, b):
    return f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 4px; border-radius: 10px; background: {T1}"><span style="height: 36px; border-radius: 8px; background: #FFFFFF; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">{a}</span><span style="height: 36px; border-radius: 8px; font-size: 13px; font-weight: 600; color: {MUTE}; display: inline-flex; align-items: center; justify-content: center">{b}</span></div>'


ITEM = f'<div style="display: flex; gap: 12px">{pic("emerald", 60, 75, 8)}<div style="flex: 1; display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 14px; line-height: 20px; font-weight: 700">Kanchipuram silk saree</strong><span style="font-size: 12px; color: {MUTE}">Emerald · With blouse piece · Qty 1</span><span style="{HF}; font-size: 14px; font-weight: 800">₹4,950</span><span style="font-size: 12px; color: {GREEN}; font-weight: 600">Return open until 19 Nov</span></div></div>'
boards['ReturnReason'] = ('Alar return reason', 390, 1010, phone(1010, hdr('Return or exchange', 'OrderDetail.dc.html', f'<span style="font-size: 13px; font-weight: 600; color: {MUTE}">Step 1 of 2</span>') + f'''
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {card(ITEM, 12)}
    
    {card(h2('Why are you returning it?', 14) + f'<div style="display: flex; flex-direction: column">{radiorow("Colour looks different from the photos", True)}{radiorow("Fabric or quality not as expected")}{radiorow("Damaged or has a defect", sub="Photos needed")}{radiorow("Wrong item received", sub="Photos needed")}{radiorow("Changed my mind")}</div>', 12, 4)}
    <div style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 13px; font-weight: 600">Add photos (optional for this reason)</span><div style="display: flex; gap: 8px">{pic('emerald', 64, 64, 10, 'center 60%')}<span style="width: 64px; height: 64px; border-radius: 10px; border: 1px dashed {T3}; background: {T4}; color: {PD}; display: inline-flex; align-items: center; justify-content: center">{ic('camera', 20, 1.800)}</span></div></div>
    {field('Tell us more (optional)', ph='What looked different?')}
  </div>''' + bar(btn('Continue', href='ReturnConfirm.dc.html'), '1fr'), PAGE))

boards['ReturnConfirm'] = ('Alar return pickup and refund', 390, 1010, phone(1010, hdr('Pickup and refund', 'ReturnReason.dc.html', f'<span style="font-size: 13px; font-weight: 600; color: {MUTE}">Step 2 of 2</span>') + f'''
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {card(f'<div style="display: flex; justify-content: space-between; align-items: center">{h2("Pickup from", 14)}<a href="Addresses.dc.html" style="font-size: 13px; font-weight: 600; text-decoration: none">Change</a></div><span style="font-size: 13px; line-height: 20px; color: {MUTE}"><strong style="color: {INK}; font-weight: 700">Lakshmi Narayanan</strong><br>14, 2nd Cross Street, Mandaveli, Chennai 600028</span><div style="display: flex; gap: 8px">{chip("Mon 16 Nov", True)}{chip("Tue 17 Nov")}{chip("Wed 18 Nov")}</div>', 12, 10)}
    {card(h2('Refund', 14) + row('Item price', '₹4,950') + row('Pickup charge', 'FREE', color=GREEN) + SEP + row('You get back', '₹4,950', True) + f'<span style="font-size: 12px; line-height: 18px; color: {MUTE}">To the UPI account you paid from, within 5 to 7 working days after we check the saree.</span>', 12, 8)}
    {card(h2('Before the pickup', 14) + f'<div style="display: flex; flex-direction: column; gap: 8px">{tip("Saree unused and unwashed")}{tip("Blouse piece still attached, not cut")}{tip("Tags and the original cover in place")}{tip("Fall or pico stitched, or blouse cut", False)}</div>', 12, 10)}
    {note('receipt', 'Returns follow our Returns, Refunds and Cancellation Policy. Damaged or wrong items are always taken back.')}
  </div>''' + bar(btn('Confirm return', href='Orders.dc.html'), '1fr'), PAGE))

# ------------------------------------------------------------------ Review
boards['Review'] = ('Alar rate and review', 390, 844, phone(844, hdr('Rate this saree', 'Orders.dc.html') + f'''
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; gap: 12px; align-items: center">{pic('emerald', 48, 60, 8)}<span style="display: flex; flex-direction: column; font-size: 13px; line-height: 18px"><strong style="font-size: 14px; font-weight: 700">Kanchipuram silk saree</strong><span style="color: {MUTE}">Emerald · Delivered on 12 Nov</span></span></div>
    <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px; border-radius: 16px; background: {T4}">{stars(4, 36)}<span style="font-size: 14px; font-weight: 600">Good</span></div>
    <div style="display: flex; flex-direction: column; gap: 8px"><span style="font-size: 13px; font-weight: 600">What did you like?</span><div style="display: flex; flex-wrap: wrap; gap: 8px">{chip('Colour as shown', True)}{chip('Soft fabric', True)}{chip('Rich border')}{chip('Good value')}{chip('Neat packing')}{chip('Fast delivery')}</div></div>
    <label style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 13px; font-weight: 600">Anything else? Only Alar reads this (optional)</span><span style="min-height: 96px; box-sizing: border-box; padding: 10px 12px; border-radius: 8px; border: 1px solid {T2}; font-size: 14px; line-height: 20px">The green is exactly like the photo and the border is beautiful.</span></label>
    <span style="font-size: 12px; line-height: 18px; color: {MUTE}">Your stars count towards the rating shown on this saree once it has 5 ratings. Your note is not shown to other shoppers.</span>
  </div>''' + bar(btn('Send rating', href='Orders.dc.html'), '1fr')))

# ================================================================== WEBSITE (1440 wide)
def webnav():
    return f'''<div style="height: 32px; background: {T1}; color: {PD}; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 24px"><span>Free delivery across South India</span><span>7 days easy return</span><span>Try any saree on your own photo</span></div>
  <div style="height: 64px; padding: 0 48px; display: flex; align-items: center; gap: 32px; border-bottom: 1px solid {LINE}; background: #FFFFFF">{logo(26)}
    <span style="display: flex; gap: 24px; font-size: 13px; font-weight: 700; letter-spacing: 0.04em"><span style="color: {P}">SAREES</span><span>SILK</span><span>COTTON</span><span>WEDDING</span><span>OFFERS</span><span style="display: inline-flex; align-items: center; gap: 4px; color: {PD}">{ic('spark', 14, 2.400)}TRY-ON</span></span>
    <span style="flex: 1; max-width: 480px; margin-left: auto; display: flex; align-items: center; gap: 8px; height: 40px; box-sizing: border-box; padding: 0 12px; border-radius: 10px; border: 1px solid {T2}; font-size: 14px; color: #9B97AD">{ic('search', 18, 2, MUTE)}Search for sarees, shirts and more</span>
    <span style="display: flex; gap: 24px; font-size: 12px; font-weight: 600">''' + ''.join(f'<span style="display: flex; flex-direction: column; align-items: center; gap: 2px">{ic(i, 20, 1.800)}{t}</span>' for i, t in [('user', 'Profile'), ('heart', 'Wishlist'), ('bag', 'Bag')]) + '</span></div>'


def webpc(k, n, s, p, m, o, badge=''):
    return pcard(k, n, s, p, m, o, 320, '', badge)


boards['WebHome'] = ('Alar website home', 1440, 1264, f'''<div style="width: 1440px; height: 1264px; box-sizing: border-box; overflow: hidden; background: #FFFFFF; color: {INK}; {BODY}; display: flex; flex-direction: column">
  {webnav()}
  <div style="padding: 24px 48px 0; display: flex; flex-direction: column; gap: 32px">
    <div style="height: 400px; border-radius: 20px; overflow: hidden; position: relative; background: {INK}">{img('wedding', 'right 30%')}
      <div style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(20, 12, 10, 0.82) 0%, rgba(20, 12, 10, 0.45) 40%, rgba(20, 12, 10, 0) 68%)"></div>
      <div style="position: absolute; left: 56px; top: 0; bottom: 0; display: flex; flex-direction: column; justify-content: center; gap: 12px; color: #FFFFFF; max-width: 440px"><span style="align-self: flex-start; height: 28px; padding: 0 12px; border-radius: 999px; background: #FFFFFF; color: {PD}; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; display: inline-flex; align-items: center">WEDDING EDIT</span><span style="{HF}; font-size: 40px; line-height: 46px; font-weight: 800; letter-spacing: -0.02em">Silks for the big day, from ₹3,200</span><span style="font-size: 14px; line-height: 22px; color: rgba(255, 255, 255, 0.85)">Kanchipuram, Banarasi and Arani silks. See each one on you before you buy.</span>{btn('Shop wedding silks', extra='align-self: flex-start; margin-top: 4px')}</div>
      <div style="position: absolute; left: 0; right: 0; bottom: 16px; display: flex; justify-content: center; gap: 6px"><span style="width: 20px; height: 6px; border-radius: 999px; background: #FFFFFF"></span><span style="width: 6px; height: 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.5)"></span><span style="width: 6px; height: 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.5)"></span><span style="width: 6px; height: 6px; border-radius: 999px; background: rgba(255, 255, 255, 0.5)"></span></div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px">{h2('Shop by category', 20)}<div style="display: grid; grid-template-columns: repeat(9, minmax(0, 1fr)); gap: 16px">''' + ''.join(f'<span style="display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 13px; font-weight: 600"><span style="width: 100%; height: 150px; border-radius: 16px; overflow: hidden; position: relative; background: {T1}; display: block">{img(k, "center")}</span>{t}</span>' for k, t in [('c_sarees', 'Sarees'), ('c_silk', 'Silk'), ('c_cotton', 'Cotton'), ('c_wedding', 'Wedding'), ('c_festive', 'Festive'), ('c_newin', 'New in'), ('c_under', 'Under ₹2,500'), ('c_shirts', 'Shirts'), ('c_dhotis', 'Dhotis')]) + f'''</div></div>
    <div style="display: flex; flex-direction: column; gap: 16px"><div style="display: flex; align-items: center; justify-content: space-between">{h2('New arrivals', 20)}<a href="#all" style="font-size: 14px; font-weight: 600; text-decoration: none">View all</a></div>
      <div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 20px">{webpc('maroon', 'Arani silk saree', 'Maroon, temple border', '₹3,150', '₹3,600', '12% OFF', 'Just in')}{webpc('peacock', 'Soft silk saree', 'Peacock blue', '₹2,400', '₹2,800', '14% OFF')}{webpc('emerald', 'Kanchipuram silk saree', 'Emerald, pink border', '₹4,950', '₹5,500', '10% OFF')}{webpc('ivory', 'Kasavu cotton saree', 'Ivory, red border', '₹1,800', '₹2,000', '10% OFF')}{webpc('violet', 'Kanchipuram silk saree', 'Violet, gold buttas', '₹4,800', '₹5,400', '11% OFF', 'Try-on ready')}</div></div>
  </div>
</div>''')


def spec(a, b):
    return f'<div style="display: flex; flex-direction: column; gap: 2px"><strong style="font-size: 13px; font-weight: 700">{a}</strong><span style="font-size: 13px; color: {MUTE}">{b}</span></div>'


def gal(k, pos='center top', blob=''):
    src = f'<img src="/_blob/{blob}" alt="" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block">' if blob else img(k, pos)
    return f'<span style="height: 470px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; display: block">{src}</span>'


boards['WebProduct'] = ('Alar website product', 1440, 1020, f'''<div style="width: 1440px; height: 1020px; box-sizing: border-box; overflow: hidden; background: #FFFFFF; color: {INK}; {BODY}; display: flex; flex-direction: column">
  {webnav()}
  <div style="padding: 16px 48px 0; display: flex; flex-direction: column; gap: 16px">
    <span style="font-size: 13px; color: {MUTE}">Home › Sarees › Silk › <strong style="color: {INK}; font-weight: 600">Arani silk saree</strong></span>
    <div style="display: grid; grid-template-columns: minmax(0, 1.350fr) minmax(0, 1fr); gap: 40px">
      <div style="display: flex; flex-direction: column; gap: 12px"><div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">{gal('maroon')}{gal('maroon', 'center 85%')}</div>
        <a href="FullSaree.dc.html" style="height: 320px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; display: block"><img src="/_blob/5ad786513b9724fe51ec5dfd3729c532" alt="Mockup image of the whole saree laid flat" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block"><span style="position: absolute; left: 12px; top: 12px; height: 32px; padding: 0 12px; border-radius: 8px; background: #FFFFFF; border: 1px solid {LINE}; color: {INK}; font-size: 13px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px">{ic('search', 16, 2, P)}Full saree · scroll to zoom, drag to move</span></a></div>
      <div style="display: flex; flex-direction: column; gap: 16px">
        <div style="display: flex; flex-direction: column; gap: 6px"><h1 style="margin: 0; {HF}; font-size: 24px; line-height: 30px; font-weight: 800; letter-spacing: -0.01em">Arani silk saree</h1><span style="font-size: 14px; color: {MUTE}">Maroon, with gold temple border and striped pallu</span><span style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px">{stars(5)}<strong style="font-weight: 700">4.6</strong><span style="color: {MUTE}">128 ratings</span></span></div>
        <div style="display: flex; align-items: center; gap: 10px"><span style="{HF}; font-size: 26px; font-weight: 800">₹3,150</span><span style="font-size: 14px; color: {MUTE}">MRP <span style="text-decoration: line-through">₹3,600</span></span><span style="height: 22px; padding: 0 8px; border-radius: 5px; background: {P}; color: #FFFFFF; font-size: 12px; font-weight: 700; display: inline-flex; align-items: center">12% OFF</span><span style="font-size: 12px; color: {MUTE}">Price includes all taxes</span></div>
        <div style="display: flex; flex-direction: column; gap: 8px"><span style="font-size: 14px"><strong style="font-weight: 700">Colour</strong> Maroon</span><div style="display: flex; gap: 10px">''' + ''.join(f'<span style="width: 56px; height: 72px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; box-sizing: border-box; border: {"2px solid " + P if k == "maroon" else "1px solid " + LINE}; display: block">{img(k)}</span>' for k in ['maroon', 'violet', 'emerald', 'peacock']) + f'''</div></div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; background: {T1}"><span style="width: 40px; height: 40px; border-radius: 12px; background: #FFFFFF; color: {P}; display: inline-flex; align-items: center; justify-content: center">{ic('spark', 20, 2)}</span><span style="flex: 1; display: flex; flex-direction: column; font-size: 13px; line-height: 18px"><strong style="font-size: 14px; font-weight: 700">See this saree on you</strong><span style="color: {MUTE}">Upload one photo. Adults only.</span></span>{btn('Try it on', 'dark', h=36, extra='font-size: 13px')}</div>
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">{btn('Buy now', 'outline', h=44)}{btn('Add to bag', icon='bag', h=44)}</div>
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid {T2}; border-radius: 12px"><span style="display: flex; align-items: center; height: 36px; padding: 0 10px; border-radius: 8px; border: 1px solid {T2}; font-size: 13px; width: 120px; box-sizing: border-box">600028</span><span style="flex: 1; display: flex; flex-direction: column; font-size: 13px; line-height: 18px"><strong style="font-weight: 700">Get it by Tue, 1 Dec</strong><span style="color: {MUTE}">Free delivery · 7 days easy return · Pay online</span></span></div>
        <div style="border: 1px solid {T2}; border-radius: 16px; padding: 16px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px">{spec('Fabric', 'Pure silk')}{spec('Weave', 'Arani')}{spec('Length', '6.2 m + 0.8 m blouse')}{spec('Border', 'Gold zari, temple')}{spec('Blouse piece', 'Attached, plain maroon')}{spec('Care', 'Dry clean only')}</div>
        <span style="font-size: 12px; line-height: 18px; color: {MUTE}">Colours may look slightly different on your screen. Only 3 left.</span>
      </div>
    </div>
  </div>
</div>''')

# ================================================================== ADMIN, batch 3
boards['AdminReturns'] = ('Alar admin returns', 1440, 900, admin('Returns', 'Returns and refunds', abtn('Export', 'ghost', 'download'), f'''
  {tabs(['To review 2', 'Pickup booked 1', 'Received, to check 1', 'Refunded 23', 'Rejected 2'], 'To review 2')}
  <div style="display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 12px; min-width: 0">
      {table(['Return', 'Order', 'Customer', 'Item', 'Reason', 'Type', 'Asked on'], [
        [bold('RT-00031'), 'AL-2611-00287', 'Lakshmi N.', pic('emerald', 28, 35, 5) + 'Kanchipuram silk, emerald', 'Colour looks different', chip('REFUND', tone='lav'), mute('14 Nov')],
        [bold('RT-00030'), 'AL-2611-00254', 'Anitha P.', pic('rust', 28, 35, 5) + 'Tussar silk, rust', 'Damaged or defect', chip('REFUND', tone='lav'), mute('13 Nov')]],
        ['0.800fr', '1.100fr', '0.900fr', '1.800fr', '1.300fr', '0.700fr', '0.700fr'])}
      {acard(h2('This month', 14) + f'<div style="display: flex; gap: 32px">' + ''.join(f'<span style="display: flex; flex-direction: column"><strong style="{HF}; font-size: 20px; font-weight: 800">{v}</strong><span style="font-size: 12px; color: {MUTE}">{t}</span></span>' for v, t in [('6.2%', 'Return rate'), ('₹71,400', 'Refunded'), ('3.4 days', 'Request to refund'), ('Colour', 'Top reason')]) + '</div>')}
      <span style="font-size: 12px; color: {MUTE}">Approving books the pickup. The refund is sent only after the saree is received and checked; stock goes back in only if it passes.</span>
    </div>
    {acard(f"""<div style="display: flex; justify-content: space-between; align-items: center">{h2('RT-00031', 16)}{chip('TO REVIEW', tone='amber')}</div>
      <div style="display: flex; gap: 10px">{pic('emerald', 44, 55, 6)}<span style="flex: 1; display: flex; flex-direction: column; font-size: 13px; line-height: 18px">{bold('Kanchipuram silk saree')}{mute('Emerald · AL-SR-0002-EMR · delivered 12 Nov')}</span>{bold('₹4,950')}</div>
      {SEP}<div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; line-height: 18px">{row('Reason', 'Colour looks different')}{row('Customer says', '"Looks darker than the photo"')}{row('Within 7 days', f'<span style="font-weight: 600; color: {GREEN}">Yes, day 2</span>')}{row('Earlier returns', '0 of 3 orders')}</div>
      <div style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 12px; font-weight: 600">Photos from the customer</span><div style="display: flex; gap: 8px">{pic('emerald', 72, 72, 8, 'center 60%')}{pic('emerald', 72, 72, 8, 'center 90%')}</div></div>
      {SEP}<div style="display: flex; flex-direction: column; gap: 4px">{check('Unused, unwashed', True)}{check('Blouse piece attached', True)}{check('Tags in place', False)}</div>
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: auto">{btn('Approve and book pickup', icon='truck', h=36, extra='font-size: 13px')}<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{abtn('Offer exchange')}{abtn('Reject with reason')}</div></div>""", gap=12)}
  </div>'''))

boards['AdminOffers'] = ('Alar admin offers', 1440, 900, admin('Offers', 'Offers and coupons', abtn('New sale price', 'ghost', 'tag') + abtn('New coupon', 'primary', 'plus'), f'''
  {tabs(['Coupons 4', 'Sale prices 12', 'Free delivery rule', 'Used coupons'], 'Coupons 4')}
  <div style="display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 12px; min-width: 0">
      {table(['Code', 'Gives', 'Minimum order', 'Used', 'Valid', 'For', 'Status', 'On'], [
        [bold('WELCOME200'), '₹200 off', '₹2,000', '84 of 500', '1 Nov to 31 Dec', 'First order', chip('LIVE', tone='green'), toggle(True)],
        [bold('PONGAL10'), '10% off, up to ₹500', '₹3,000', '0 of 1,000', '8 Jan to 17 Jan', 'Everyone', chip('SCHEDULED', tone='lav'), toggle(True)],
        [bold('SILK300'), '₹300 off', '₹4,000', '31 of 200', '15 Nov to 15 Dec', 'Silk sarees', chip('LIVE', tone='green'), toggle(True)],
        [bold('DIWALI15'), '15% off, up to ₹750', '₹3,000', '212 of 300', '1 Oct to 5 Nov', 'Everyone', chip('ENDED', tone='grey'), toggle(False)]],
        ['1.100fr', '1.300fr', '0.900fr', '0.800fr', '1.200fr', '0.900fr', '0.800fr', '0.400fr'])}
      <span style="font-size: 12px; color: {MUTE}">Discounts are always whole rupees. A coupon can never take a saree below its cost; the system refuses it at checkout.</span>
    </div>
    {acard(h2('New coupon', 16) + afield('Code', 'NEWYEAR250') + f'<div style="display: flex; gap: 12px">{afield("Type", "Amount off", sel=True)}{afield("Value", "₹250")}</div><div style="display: flex; gap: 12px">{afield("Minimum order", "₹2,500")}{afield("Total uses", "400")}</div><div style="display: flex; gap: 12px">{afield("From", "28 Dec 2026")}{afield("Until", "5 Jan 2027")}</div>' + afield('Works on', 'All categories', sel=True) + f'<div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px"><span>One use per customer</span>{toggle(True)}</div><div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px"><span>Show on the product page offer card</span>{toggle(True)}</div><div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px"><span>Can be used with a sale price</span>{toggle(False)}</div>' + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: auto">{abtn("Cancel")}{abtn("Create coupon", "primary")}</div>', gap=10)}
  </div>'''))


def snav(t, on=False):
    st = f'background: {T1}; color: {PD}; font-weight: 700' if on else f'color: {INK}; font-weight: 500'
    return f'<span style="height: 36px; padding: 0 10px; border-radius: 8px; display: flex; align-items: center; font-size: 13px; {st}">{t}</span>'


boards['AdminSettings'] = ('Alar admin settings', 1440, 900, admin('Settings', 'Settings', abtn('Save changes', 'primary'), f'''
  <div style="display: grid; grid-template-columns: 200px minmax(0, 1fr) minmax(0, 1fr); gap: 16px; flex: 1; min-height: 0">
    {acard(snav('Store and brand', True) + snav('Payments') + snav('Delivery') + snav('Taxes and invoices') + snav('Returns') + snav('Messages') + snav('Legal pages') + snav('Dated legal values') + snav('Backups'), gap=4, pad=8)}
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {acard(h2('Brand', 14) + f'<div style="display: flex; gap: 12px">{afield("Store name", "Alar", hint="Used in the app, website, emails and invoices. Change it here and it changes everywhere.")}{afield("Short tagline", "Sarees you can see on you")}</div><div style="display: flex; gap: 12px">{afield("Legal name on invoices", "[Company name]")}{afield("GSTIN", "[To be added]")}</div><div style="display: flex; gap: 12px; align-items: center"><span style="width: 44px; height: 44px; border-radius: 12px; background: {P}; flex-shrink: 0"></span>{afield("Primary colour", "#6F52F0")}{afield("Logo", "alar-wordmark.svg")}</div>', gap=10)}
      {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Payments", 14)}{chip("RAZORPAY · TEST MODE", tone="amber")}</div>' + tog('UPI', True) + SEP + tog('Cards', True) + SEP + tog('Net banking', True) + SEP + tog('Cash on delivery', False, 'Planned for later. Turning it on needs a courier that collects cash.') + f'<div style="display: flex; gap: 12px">{afield("Hold stock while paying", "15 minutes")}{afield("Refunds go to", "Original payment", sel=True)}</div>', gap=4)}
    </div>
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {acard(h2('Delivery', 14) + afield('Courier partner', '[Provider to be chosen]', sel=True) + f'<div style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 12px; font-weight: 600">We deliver to</span><div style="display: flex; flex-wrap: wrap; gap: 6px">{chip("Tamil Nadu", True)}{chip("Kerala", True)}{chip("Karnataka", True)}{chip("Andhra Pradesh", True)}{chip("Telangana", True)}{chip("Puducherry", True)}{chip("+ Add state")}</div></div><div style="display: flex; gap: 12px">{afield("Free delivery above", "₹0 (always free)")}{afield("Return window", "7 days")}</div>', gap=10)}
      {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Tax bands", 14)}{chip("CHECK WITH ACCOUNTANT", tone="amber")}</div>' + table(['Band', 'Rate', 'Applies to', 'From'], [[bold('Saree (fabric)'), '5%', 'All sarees', '22 Sep 2025'], [bold('Garment, low'), '5%', 'Up to ₹2,500', '22 Sep 2025'], [bold('Garment, high'), '18%', 'Above ₹2,500', '22 Sep 2025']], ['1.300fr', '0.500fr', '1.100fr', '1fr']) + f'<span style="font-size: 12px; line-height: 18px; color: {MUTE}">Shelf prices include tax and stay whole rupees. A new rate is added with its start date; old invoices keep the old rate.</span>', gap=10)}
    </div>
  </div>'''))


def mv(when, k, v, ch, why, by, bal):
    c = GREEN if ch.startswith('+') else RED
    return [mute(when), pic(k, 28, 35, 5) + f'<span style="display: flex; flex-direction: column">{bold(v)}</span>', f'<strong style="font-weight: 700; color: {c}">{ch}</strong>', why, mute(by), bold(bal)]


boards['AdminInventory'] = ('Alar admin stock', 1440, 900, admin('Stock', 'Stock', abtn('Stock count', 'ghost', 'box') + abtn('Receive stock', 'primary', 'plus'), f'''
  <div style="display: flex; gap: 16px">{kpi('Pieces in stock', '1,012', 'Across 104 products', MUTE)}{kpi('On hold right now', '4', 'In checkouts, released after 15 min', AMBER)}{kpi('Low stock', '6', 'Below alert level', AMBER)}{kpi('Sold out', '2', 'Hidden from Buy, shown as Sold out', RED)}{kpi('Stock value at cost', '₹18.4 L', 'Owner only', MUTE)}</div>
  <div style="display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 12px; min-width: 0">
      {tabs(['Movements', 'By product', 'Low stock 6', 'Count differences'], 'Movements')}
      {table(['When', 'Variant', 'Change', 'Why', 'By', 'Balance'], [
        mv('Today 6:42 pm', 'maroon', 'Arani silk · Maroon', '−1', 'Sold · AL-2611-00418', 'System', '3'),
        mv('Today 6:41 pm', 'maroon', 'Arani silk · Maroon', 'Hold 1', 'Checkout started', 'System', '4 (1 held)'),
        mv('Today 4:10 pm', 'violet', 'Kanchipuram · Violet', '+10', 'Received · batch NOV-26-B', 'Saranya K.', '27'),
        mv('Today 1:15 pm', 'peacock', 'Soft silk · Peacock', '+1', 'Return passed check · RT-00028', 'Murugan V.', '41'),
        mv('Yesterday', 'navy', 'Banarasi · Navy', '−1', 'Damaged, written off', 'Arun', '0'),
        mv('Yesterday', 'ivory', 'Kasavu cotton · Ivory', '−2', 'Stock count correction', 'Arun', '10')],
        ['1fr', '1.800fr', '0.700fr', '1.800fr', '0.900fr', '0.800fr'])}
      <span style="font-size: 12px; color: {MUTE}">Stock changes only through these named actions. Nobody can type over a number without a reason, and every line stays in the log.</span>
    </div>
    {acard(h2('Receive stock', 16) + afield('Product', 'Arani silk saree', sel=True) + afield('Colour', 'Maroon', sel=True) + f'<div style="display: flex; gap: 12px">{afield("Pieces", "10")}{afield("Cost per piece", "₹2,050")}</div>' + afield('Weaver (admin only)', 'Family loom 03, Arani', sel=True) + afield('Batch', 'DEC-26-A') + afield('Note', 'Checked for defects, all good', 52) + f'<div style="display: flex; justify-content: space-between; font-size: 13px"><span>Stock after this</span><strong style="font-weight: 700">13 pieces</strong></div><div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: auto">{abtn("Cancel")}{abtn("Add to stock", "primary")}</div>', gap=10)}
  </div>'''))


def tree(t, lvl=0, on=False, tag=''):
    st = f'background: {T1}; color: {PD}; font-weight: 700' if on else f'color: {INK}; font-weight: {600 if lvl == 0 else 500}'
    tg = ('<span style="margin-left: auto">' + chip(tag, tone='grey' if tag == 'DRAFT' else 'green') + '</span>') if tag else ''
    return f'<span style="height: 34px; padding: 0 10px 0 {10 + lvl * 18}px; border-radius: 8px; display: flex; align-items: center; gap: 8px; font-size: 13px; {st}"><span style="color: {MUTE}">{ic("drag", 14, 3)}</span>{t}{tg}</span>'


def attr(n, typ, vals, req=True, flt=True):
    return [bold(n), typ, mute(vals), toggle(req), toggle(flt)]


boards['AdminCategories'] = ('Alar admin categories', 1440, 900, admin('Categories', 'Categories and attributes', abtn('Add category', 'ghost', 'plus') + abtn('Save changes', 'primary'), f'''
  <div style="display: grid; grid-template-columns: 300px minmax(0, 1fr) 320px; gap: 16px; flex: 1; min-height: 0">
    {acard(h2('Category tree', 14) + tree('Women', 0, tag='LIVE') + tree('Sarees', 1, True) + tree('Silk', 2) + tree('Cotton', 2) + tree('Wedding', 2) + tree('Festive', 2) + tree('Blouses', 1, tag='DRAFT') + tree('Men', 0, tag='DRAFT') + tree('Shirts', 1) + tree('Dhotis', 1) + tree('Kids', 0, tag='DRAFT') + f'<span style="font-size: 12px; line-height: 18px; color: {MUTE}; margin-top: 8px">A draft department is hidden from shoppers until you make it live. Nothing in the app is built only for sarees.</span>', gap=2)}
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Sarees: product details", 14)}{abtn("Add detail", icon="plus")}</div>' + table(['Detail', 'Type', 'Choices', 'Required', 'Filter'], [
        attr('Fabric', 'Pick one', 'Pure silk, Soft silk, Cotton, Silk cotton, Tussar, Linen'), attr('Weave', 'Pick one', 'Arani, Kanchipuram, Chettinad, Banarasi…'),
        attr('Colour', 'Colour', '18 named colours'), attr('Border', 'Pick one', 'Temple, Plain zari, Checked, Contrast', False),
        attr('Occasion', 'Pick many', 'Wedding, Festive, Daily, Office', False), attr('Length', 'Number (m)', '5.5 to 6.5', True, False),
        attr('Blouse piece', 'Yes or no', 'Attached, colour', True, False)], ['1fr', '0.900fr', '2.400fr', '0.600fr', '0.500fr']), gap=10)}
      {acard(h2('How this category sells', 14) + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 24px">{tog("Has sizes", False, "Sarees: colour only. Shirts: colour and size.")}{tog("Full-length zoom view", True, "Needs a 21:9 flat photo")}{tog("AI try-on allowed", True, "Uses the saree prompt")}{tog("Size chart on the page", False)}</div>', gap=6)}
    </div>
    {acard(h2('Category page', 14) + afield('Name shown', 'Sarees') + afield('Web address', '/sarees') + f'<span style="font-size: 12px; font-weight: 600">Thumbnail</span><span style="width: 96px; height: 116px; border-radius: 16px; overflow: hidden; position: relative; background: {T1}; display: block">{img("c_sarees", "center")}</span>' + afield('Tax band', 'Saree (fabric) 5%', sel=True) + afield('Sort by default', 'Newest first', sel=True) + afield('Return window', 'Store default (7 days)', sel=True) + tog('Show in the app', True), gap=10)}
  </div>'''))

boards['AdminAIReports'] = ('Alar admin AI reports', 1440, 900, admin('AI try-on', 'AI try-on controls', abtn('Save changes', 'primary'), f'''
  {tabs(['Models and routing', 'Prompts', 'Safety checks', 'Consent notice', 'Reports 2', 'Usage and cost'], 'Reports 2')}
  <div style="display: grid; grid-template-columns: minmax(0, 1fr) 440px; gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {table(['Report', 'Reason given', 'Saree', 'Model', 'Prompt', 'When', 'Status'], [
        [bold('RP-0012'), 'Saree looks wrong', pic('violet', 28, 35, 5) + 'Kanchipuram, violet', 'Gemini image', 'v7', mute('Today 3:12 pm'), chip('TO REVIEW', tone='amber')],
        [bold('RP-0011'), 'My face was changed', pic('maroon', 28, 35, 5) + 'Arani silk, maroon', 'GPT Image', 'v7', mute('Yesterday'), chip('TO REVIEW', tone='amber')],
        [bold('RP-0010'), 'Saree looks wrong', pic('navy', 28, 35, 5) + 'Banarasi, navy', 'Gemini image', 'v6', mute('22 Nov'), chip('FIXED IN V7', tone='green')]],
        ['0.700fr', '1.200fr', '1.600fr', '0.900fr', '0.500fr', '0.900fr', '0.900fr'])}
      {acard(h2('Usage and cost, last 7 days', 14) + '<div style="display: flex; gap: 32px">' + ''.join(f'<span style="display: flex; flex-direction: column"><strong style="{HF}; font-size: 20px; font-weight: 800">{v}</strong><span style="font-size: 12px; color: {MUTE}">{t}</span></span>' for v, t in [('1,318', 'Try-ons made'), ('₹6,940', 'Spent'), ('₹5.27', 'Per try-on'), ('18%', 'Added to bag after'), ('0.9%', 'Reported')]) + '</div>' + f'<div style="display: flex; align-items: flex-end; gap: 10px; height: 120px">' + ''.join(f'<span style="flex: 1; height: {h}%; border-radius: 6px 6px 0 0; background: {P if i == 6 else T3}"></span>' for i, h in enumerate([52, 61, 48, 70, 66, 83, 95])) + '</div>')}
    </div>
    {acard(f"""<div style="display: flex; justify-content: space-between; align-items: center">{h2('RP-0012', 16)}{chip('OWNER ONLY', tone='grey')}</div>
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px"><span style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: {MUTE}"><span style="height: 230px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; display: block">{img('violet')}<span style="position: absolute; left: 22%; top: 3%; width: 56%; height: 22%; border-radius: 999px; background: #D8D4E6"></span></span>Result (face hidden)</span><span style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: {MUTE}"><span style="height: 230px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; display: block">{img('violet', 'center 80%')}</span>Real product photo</span></div>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; line-height: 18px">{row('Shopper says', '"Border is silver, not gold"')}{row('Model', 'Gemini image · 13 s')}{row('Prompt', 'Saree, Nivi drape · v7')}{row('Automatic check', f'<span style="font-weight: 600; color: {GREEN}">Passed</span>')}</div>
      {note('shield', "The shopper's own photo is never shown to staff. The result is shown with the face hidden, to the owner only, and only because it was reported.")}
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: auto">{btn('Remove result and give the try-on back', h=36, extra='font-size: 13px')}<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px">{abtn('Turn off try-on for this saree')}{abtn('Close, no action')}</div></div>""", gap=12)}
  </div>'''))

boards['AdminAudit'] = ('Alar admin audit log', 1440, 900, admin('Customers', 'Customers and staff', abtn('Export', 'ghost', 'download'), f'''
  {tabs(['Customers 1,284', 'Staff 3', 'Roles', 'Deletion requests 1', 'Audit log'], 'Audit log')}
  <div style="display: flex; align-items: center; gap: 8px"><span style="display: flex; align-items: center; gap: 8px; width: 280px; height: 36px; box-sizing: border-box; padding: 0 12px; border-radius: 8px; border: 1px solid {T2}; background: #FFFFFF; font-size: 13px; color: #9B97AD">{ic('search', 16, 2, MUTE)}Search the log</span>{chip('Everything', True)}{chip('Prices')}{chip('Stock')}{chip('AI settings')}{chip('Sign-ins')}{chip('Customer data')}<span style="margin-left: auto; display: flex; gap: 8px">{abtn('Who: Anyone')}{abtn('Last 7 days')}</span></div>
  {table(['When', 'Who', 'Area', 'What changed', 'Before', 'After'], [
    [mute('Today 6:02 pm'), bold('Arun') + chip('OWNER', tone='lav'), 'AI settings', 'Daily spend limit', '₹1,500', bold('₹2,000')],
    [mute('Today 4:10 pm'), bold('Saranya K.'), 'Stock', 'Received Kanchipuram · Violet', '17', bold('27')],
    [mute('Today 2:41 pm'), bold('Arun') + chip('OWNER', tone='lav'), 'Prices', 'Arani silk saree, selling price', '₹3,250', bold('₹3,150')],
    [mute('Today 11:20 am'), bold('Murugan V.'), 'Orders', 'AL-2611-00409 marked packed', 'To pack', bold('Packed')],
    [mute('Today 9:58 am'), bold('Saranya K.'), 'Sign-in', 'Signed in with password and code', '', mute('Chennai · Chrome')],
    [mute('Yesterday 7:15 pm'), bold('Arun') + chip('OWNER', tone='lav'), 'AI settings', 'Prompt "Saree, Nivi drape" published', 'v6', bold('v7')],
    [mute('Yesterday 5:30 pm'), bold('Arun') + chip('OWNER', tone='lav'), 'Customer data', 'Erased account on request (DR-0004)', 'Active', bold('Erased')],
    [mute('Yesterday 3:02 pm'), bold('System'), 'Sign-in', '5 wrong codes, account locked 15 min', 'Murugan V.', mute('Unknown device')],
    [mute('25 Nov 6:40 pm'), bold('Saranya K.'), 'App content', 'Home screen published', 'Version 11', bold('Version 12')]],
    ['1fr', '1.200fr', '0.800fr', '2.200fr', '0.900fr', '1fr'])}
  <span style="font-size: 12px; color: {MUTE}">The log cannot be edited or deleted by anyone, including the owner. Both admin systems write to it.</span>'''))

# ================================================================== BATCH 4: last shopper, website and admin screens
def sticky_agree(inner):
    return f'<div style="margin-top: auto; padding: 12px 16px 20px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid {LINE}; background: #FFFFFF">{inner}</div>'


# ------------------------------------------------------------------ Exchange colour
def cth(k, name, sub, on=False, off=False):
    bd = f'2px solid {P}' if on else f'1px solid {LINE}'
    return f'<span style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; line-height: 16px; opacity: {0.45 if off else 1}"><span style="height: 100px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; border: {bd}; box-sizing: border-box; display: block">{img(k)}</span><strong style="font-weight: 700">{name}</strong><span style="color: {MUTE}">{sub}</span></span>'


boards['ExchangeColour'] = ('Alar exchange', 390, 1010, phone(1010, hdr('Return or exchange', 'OrderDetail.dc.html', f'<span style="font-size: 13px; font-weight: 600; color: {MUTE}">Step 1 of 2</span>') + f'''
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {card(ITEM, 12)}
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 4px; border-radius: 10px; background: {T1}"><span style="height: 36px; border-radius: 8px; font-size: 13px; font-weight: 600; color: {MUTE}; display: inline-flex; align-items: center; justify-content: center">Return for refund</span><span style="height: 36px; border-radius: 8px; background: #FFFFFF; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">Exchange colour</span></div>
    {card(h2('Pick the colour you want instead', 14) + f'<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px">{cth("violet", "Violet", "₹4,800", True)}{cth("maroon", "Maroon", "₹4,950")}{cth("peacock", "Peacock", "₹4,950")}{cth("navy", "Navy", "Sold out", False, True)}</div>', 12, 10)}
    {card(h2('Price difference', 14) + row('Emerald, you paid', '₹4,950') + row('Violet, today', '₹4,800') + SEP + row('We send back', '₹150', True, GREEN) + f'<span style="font-size: 12px; line-height: 18px; color: {MUTE}">If the new colour costs more, you pay the difference online before pickup.</span>', 12, 8)}
    {note('truck', 'The courier brings the violet saree and takes the emerald one in the same visit. One exchange per order.')}
  </div>''' + bar(btn('Continue', href='ReturnConfirm.dc.html'), '1fr'), PAGE))

# ------------------------------------------------------------------ Reviews
def rbar(n, pct):
    return f'<span style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: {MUTE}"><span style="width: 8px">{n}</span><span style="flex: 1; height: 6px; border-radius: 999px; background: {T1}; overflow: hidden"><span style="display: block; width: {pct}%; height: 100%; border-radius: 999px; background: {P}"></span></span><span style="width: 24px; text-align: right">{pct}%</span></span>'


def rev(n, s, when, text, k=''):
    ph = f'<div style="display: flex; gap: 8px">{pic(k, 56, 56, 8, "center 60%")}</div>' if k else ''
    return f'<div style="padding: 12px 0; border-bottom: 1px solid {LINE}; display: flex; flex-direction: column; gap: 6px"><div style="display: flex; align-items: center; justify-content: space-between">{stars(s)}<span style="font-size: 12px; color: {MUTE}">{when}</span></div><span style="font-size: 14px; line-height: 20px">{text}</span>{ph}<span style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: {MUTE}"><strong style="color: {INK}; font-weight: 600">{n}</strong><span style="display: inline-flex; align-items: center; gap: 3px; color: {GREEN}; font-weight: 600">{ic("check", 12, 3)}Bought on Alar</span></span></div>'


boards['Reviews'] = ('Alar ratings and reviews', 390, 1010, phone(1010, hdr('Ratings and reviews', 'Product.dc.html', sub='Arani silk saree') + f'''
  <div style="padding: 16px 16px 0; display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 20px; align-items: center"><span style="display: flex; flex-direction: column; align-items: center; gap: 2px"><strong style="{HF}; font-size: 36px; line-height: 40px; font-weight: 800">4.6</strong>{stars(5, 12)}<span style="font-size: 12px; color: {MUTE}">128 ratings</span></span><span style="flex: 1; display: flex; flex-direction: column; gap: 5px">{rbar(5, 71)}{rbar(4, 20)}{rbar(3, 6)}{rbar(2, 2)}{rbar(1, 1)}</span></div>
    <div style="display: flex; flex-wrap: wrap; gap: 8px">{chip('All 46', True)}{chip('With photos 12')}{chip('Colour as shown 31')}{chip('Soft fabric 22')}</div>
    <div style="display: flex; flex-direction: column">
      {rev('Divya', 5, '18 Nov', 'The maroon is rich and the border has real weight. Looks exactly like the full saree photo.', 'maroon')}
      {rev('Meena', 4, '11 Nov', 'Lovely saree. Slightly darker than on my phone but still beautiful.')}
      {rev('Kavitha', 5, '2 Nov', 'Tried it on with my photo first and it matched well. Wore it for a wedding.', 'maroon')}
      {rev('Shanthi', 3, '25 Oct', 'Good fabric. Delivery took one day more than promised.')}
    </div>
  </div>'''))

# ------------------------------------------------------------------ Coupons
def coupon(code, title, cond, on=True):
    c = PD if on else MUTE
    act = f'<span style="height: 32px; padding: 0 12px; border-radius: 8px; background: {T1}; color: {PD}; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center">Apply</span>' if on else f'<span style="font-size: 12px; font-weight: 600; color: {MUTE}">Add ₹1,050 more</span>'
    return f'<div style="background: #FFFFFF; border: 1px solid {LINE}; border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px; opacity: {1 if on else 0.75}"><div style="display: flex; align-items: center; justify-content: space-between"><span style="height: 28px; padding: 0 10px; border-radius: 8px; border: 1px dashed {T3 if on else "#CFCBDD"}; background: {T4}; color: {c}; {HF}; font-size: 13px; font-weight: 800; letter-spacing: 0.04em; display: inline-flex; align-items: center">{code}</span>{act}</div><strong style="font-size: 14px; line-height: 20px; font-weight: 700">{title}</strong><span style="font-size: 12px; line-height: 18px; color: {MUTE}">{cond}</span></div>'


boards['Coupons'] = ('Alar coupons', 390, 844, phone(844, hdr('Coupons', 'Bag.dc.html') + f'''
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    <div style="display: flex; gap: 8px"><span style="flex: 1; display: flex; align-items: center; height: 40px; box-sizing: border-box; padding: 0 12px; border-radius: 8px; border: 1px solid {T2}; background: #FFFFFF; font-size: 14px; color: #9B97AD">Enter coupon code</span>{btn('Apply', 'dark')}</div>
    {h2('You can use', 14)}
    {coupon('WELCOME200', '₹200 off your first order', 'On orders of ₹2,000 or more. Ends 31 Dec.')}
    {coupon('SILK300', '₹300 off silk sarees', 'On orders of ₹4,000 or more. Ends 15 Dec.')}
    {h2('Not yet', 14)}
    {coupon('BIG500', '₹500 off', 'On orders of ₹6,000 or more. Ends 31 Dec.', False)}
    <span style="font-size: 12px; line-height: 18px; color: {MUTE}">One coupon per order. Coupons do not combine with a sale price unless the coupon says so.</span>
  </div>''', PAGE))

# ------------------------------------------------------------------ Edit profile / language / no internet
boards['EditProfile'] = ('Alar edit profile', 390, 844, phone(844, hdr('Edit profile', 'Profile.dc.html') + f'''
  <div style="padding: 20px 16px 0; display: flex; flex-direction: column; gap: 14px">
    <span style="align-self: center; width: 72px; height: 72px; border-radius: 999px; background: {P}; color: #FFFFFF; {HF}; font-size: 26px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center">LN</span>
    {field('Full name', 'Lakshmi Narayanan')}
    <label style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 13px; font-weight: 600">Mobile number</span><span style="display: flex; align-items: center; height: 44px; box-sizing: border-box; padding: 0 12px; border-radius: 8px; border: 1px solid {T2}; background: #F6F5FA; font-size: 14px"><span style="flex: 1">+91 98400 12345</span><a href="Otp.dc.html" style="font-size: 13px; font-weight: 600; text-decoration: none">Change</a></span><span style="font-size: 12px; color: {MUTE}">Changing it needs an OTP on the new number.</span></label>
    {field('Email (optional)', 'lakshmi@example.com')}
  </div>''' + sticky_agree(btn('Save', href='Profile.dc.html'))))

boards['Language'] = ('Alar language', 390, 844, phone(844, hdr('Language', 'Profile.dc.html') + f'''
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {card(radiorow('English', True) + SEP + radiorow('தமிழ்', False, 'Tamil') + SEP + radiorow('తెలుగు', False, 'Telugu') + SEP + radiorow('ಕನ್ನಡ', False, 'Kannada') + SEP + radiorow('മലയാളം', False, 'Malayalam'), 16, 0, 'padding-top: 4px; padding-bottom: 4px')}
    {note('globe', 'Menus, buttons, order messages and help change to your language. Saree names and weave names stay as they are.')}
  </div>''' + sticky_agree(btn('Apply', href='Profile.dc.html')), PAGE))

boards['NoInternet'] = ('Alar no internet', 390, 844, phone(844, f'''
  <div style="flex: 1; padding: 0 32px; display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center; text-align: center">
    <span style="width: 72px; height: 72px; border-radius: 999px; background: {T1}; color: {P}; display: inline-flex; align-items: center; justify-content: center">{ic('wifi', 32, 1.800)}</span>
    <h1 style="margin: 0; {HF}; font-size: 20px; line-height: 26px; font-weight: 800">You are offline</h1>
    <p style="margin: 0; font-size: 14px; line-height: 22px; color: {MUTE}">Check your internet and try again. Your bag and wishlist are safe.</p>
    {btn('Try again', extra='width: 200px; margin-top: 8px')}
    <a href="Orders.dc.html" style="font-size: 13px; font-weight: 600; text-decoration: none">See my saved orders</a>
  </div>''' + nav('Home')))

# ------------------------------------------------------------------ Full consent notice
def sec(t, body):
    return f'<div style="display: flex; flex-direction: column; gap: 4px"><strong style="font-size: 14px; line-height: 20px; font-weight: 700">{t}</strong><span style="font-size: 13px; line-height: 20px; color: {MUTE}">{body}</span></div>'


boards['ConsentNotice'] = ('Alar try-on notice', 390, 1180, phone(1180, hdr('Try-on photo notice', 'Consent.dc.html', chip('VERSION 3', tone='lav'), 'In force from 20 Nov 2026') + f'''
  <div style="padding: 16px 16px 0; display: flex; flex-direction: column; gap: 14px">
    <div style="display: flex; gap: 6px; overflow: hidden">{chip('English', True)}{chip('தமிழ்')}{chip('తెలుగు')}{chip('ಕನ್ನಡ')}{chip('മലയാളം')}</div>
    {sec('What we take', 'One photo of you that you choose, and the photo of the saree you want to try.')}
    {sec('Why', 'Only to make a picture of you wearing that saree. We do not use it for ads, for training AI, or for anything else.')}
    {sec('Who receives it', 'Our AI service providers: Google (Gemini image) and OpenAI (GPT Image), reached through OpenRouter. They process the photo for us and may do so outside India. They are not allowed to keep it or train on it.')}
    {sec('How long we keep it', 'Your photo: until you delete it, or 30 days after you last used try-on. Try-on pictures: until you delete them.')}
    {sec('Who can use try-on', 'Only adults, 18 or older, and only with a photo of yourself. Photos of children or of other people are refused.')}
    {sec('Your choices', 'You can see, correct or delete your photo and pictures, and withdraw this consent at any time in Profile, Privacy and consent. Withdrawing deletes them at once and does not affect shopping.')}
    {sec('If something is wrong', 'Write to our Grievance Officer from Profile, Help. We reply within 48 hours. You may also complain to the Data Protection Board of India.')}
    {note('receipt', 'Draft wording. To be checked by a lawyer before launch.', 'amber')}
  </div>''' + sticky_agree(btn('I agree, choose a photo', href='TryOnPhoto.dc.html') + f'<a href="Product.dc.html" style="display: inline-flex; align-items: center; justify-content: center; height: 36px; font-size: 14px; font-weight: 600; color: {MUTE}; text-decoration: none">Not now</a>')))

# ------------------------------------------------------------------ Delete account
boards['DeleteAccount'] = ('Alar delete account', 390, 844, phone(844, hdr('Delete my account', 'Privacy.dc.html') + f'''
  <div style="padding: 16px 16px 0; display: flex; flex-direction: column; gap: 12px">
    {note('alert', 'You have 1 order on the way (AL-2611-00418). You can delete your account after it is delivered and the return window has closed.', 'amber')}
    {card(h2('What is deleted', 14) + f'<div style="display: flex; flex-direction: column; gap: 8px">{tip("Name, mobile number, email and addresses", False)}{tip("Try-on photo and all try-on pictures", False)}{tip("Wishlist, reviews and saved coupons", False)}</div>', 12, 10)}
    {card(h2('What we must keep', 14) + f'<span style="font-size: 13px; line-height: 20px; color: {MUTE}">Tax invoices for your orders, for the period the law requires. They are locked away and not used for anything else.</span>', 12, 6)}
    <div style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 13px; font-weight: 600">Enter the code sent to +91 98400 12345</span><div style="display: flex; justify-content: space-between">{otpbox('')}{otpbox('')}{otpbox('')}{otpbox('')}{otpbox('')}{otpbox('')}</div></div>
    <span style="font-size: 12px; line-height: 18px; color: {MUTE}">Deletion is final and is completed within 7 days. You will get a confirmation by SMS.</span>
  </div>''' + sticky_agree(f'<span style="height: 40px; border-radius: 8px; background: #F6F5FA; border: 1px solid {LINE}; color: {MUTE}; font-size: 14px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">Delete my account</span>' + btn('Keep my account', 'ghost', href='Privacy.dc.html')), PAGE))

# ------------------------------------------------------------------ Size chart (shirts)
def szrow(s, a, b, c, on=False):
    st = f'background: {T4}; font-weight: 700' if on else ''
    return f'<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); height: 40px; align-items: center; padding: 0 12px; border-bottom: 1px solid {LINE}; font-size: 13px; {st}"><span style="font-weight: 700">{s}</span><span>{a}</span><span>{b}</span><span>{c}</span></div>'


boards['SizeChart'] = ('Alar size chart', 390, 844, phone(844, hdr('Size chart', 'Shirt.dc.html', sub='Handloom cotton shirt, regular fit') + f'''
  <div style="padding: 12px 16px 0; display: flex; flex-direction: column; gap: 12px">
    <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px; padding: 4px; border-radius: 10px; background: {T1}; width: 160px"><span style="height: 32px; border-radius: 8px; background: #FFFFFF; font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center">Inches</span><span style="height: 32px; border-radius: 8px; font-size: 13px; font-weight: 600; color: {MUTE}; display: inline-flex; align-items: center; justify-content: center">cm</span></div>
    <div style="border: 1px solid {LINE}; border-radius: 16px; overflow: hidden; background: #FFFFFF"><div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); height: 36px; align-items: center; padding: 0 12px; background: {T4}; border-bottom: 1px solid {LINE}; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; color: {MUTE}"><span>SIZE</span><span>CHEST</span><span>LENGTH</span><span>SHOULDER</span></div>{szrow('38', '41.3', '27.5', '17.0')}{szrow('40', '43.3', '28.0', '17.5')}{szrow('42', '45.3', '28.5', '18.0', True)}{szrow('44', '47.3', '29.0', '18.5')}{szrow('46', '49.3', '29.5', '19.0')}{szrow('48', '51.3', '30.0', '19.5')}</div>
    {note('check', 'Size 42 is highlighted because you chose it on the product page. Measurements are of the shirt, not the body.', 'green')}
    {card(h2('How to measure', 14) + f'<div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px; line-height: 20px; color: {MUTE}"><span><strong style="color: {INK}; font-weight: 600">Chest:</strong> around the fullest part, tape flat.</span><span><strong style="color: {INK}; font-weight: 600">Length:</strong> from the top of the shoulder to the hem.</span><span><strong style="color: {INK}; font-weight: 600">Shoulder:</strong> seam to seam across the back.</span></div>', 12, 8)}
  </div>''', PAGE))

# ================================================================== WEBSITE, batch 4
def webpage(title, h, body, bg='#FFFFFF'):
    return (title, 1440, h, f'<div style="width: 1440px; height: {h}px; box-sizing: border-box; overflow: hidden; background: {bg}; color: {INK}; {BODY}; display: flex; flex-direction: column; position: relative">{webnav()}{body}</div>')


def fgroup(t, inner):
    return f'<div style="display: flex; flex-direction: column; gap: 2px; padding-bottom: 12px; border-bottom: 1px solid {LINE}"><strong style="font-size: 13px; font-weight: 700; letter-spacing: 0.04em; height: 36px; display: flex; align-items: center">{t}</strong>{inner}</div>'


def dot(c, on=False):
    return f'<span style="width: 28px; height: 28px; border-radius: 999px; background: {c}; box-sizing: border-box; border: 1px solid {LINE}; outline: {"2px solid " + P if on else "none"}; outline-offset: 2px"></span>'


def wc(t, on=False, n=''):
    return check(t, on, n).replace('min-height: 40px', 'min-height: 32px').replace('font-size: 14px', 'font-size: 13px')


boards['WebListing'] = webpage('Alar website listing', 1060, f'''
  <div style="padding: 16px 48px 0; display: flex; flex-direction: column; gap: 12px">
    <span style="font-size: 13px; color: {MUTE}">Home › Sarees › <strong style="color: {INK}; font-weight: 600">Silk sarees</strong></span>
    <div style="display: flex; align-items: center; gap: 12px"><h1 style="margin: 0; {HF}; font-size: 22px; line-height: 28px; font-weight: 800">Silk sarees</h1><span style="font-size: 13px; color: {MUTE}">73 items</span><span style="margin-left: auto; display: flex; gap: 8px; align-items: center">{chip('Pure silk ×')}{chip('Soft silk ×')}{chip('Maroon ×')}<span style="display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border-radius: 8px; border: 1px solid {T2}; font-size: 13px">Sort by: <strong style="font-weight: 700">Newest first</strong><span style="transform: rotate(90deg); display: inline-flex; color: {MUTE}">{ic("right", 14, 2.400)}</span></span></span></div>
    <div style="display: grid; grid-template-columns: 232px minmax(0, 1fr); gap: 32px">
      <div style="display: flex; flex-direction: column; gap: 4px">
        <div style="display: flex; align-items: center; justify-content: space-between; height: 36px"><strong style="font-size: 14px; font-weight: 700">Filters</strong><a href="#clear" style="font-size: 13px; font-weight: 600; text-decoration: none">Clear all</a></div>
        {fgroup('FABRIC', wc('Pure silk', True, '42') + wc('Soft silk', True, '31') + wc('Cotton', False, '28') + wc('Silk cotton', False, '14') + wc('Tussar', False, '8'))}
        {fgroup('COLOUR', f'<div style="display: flex; flex-wrap: wrap; gap: 10px; padding: 4px 2px">{dot("#7A1F3D", True)}{dot("#5B2D91")}{dot("#0F6B4A")}{dot("#0E5E73")}{dot("#EDE3CF")}{dot("#D9A21B")}{dot("#C8561F")}{dot("#1D2B5E")}{dot("#C2386B")}{dot("#15151A")}</div>')}
        {fgroup('PRICE', wc('Under ₹2,500', False, '19') + wc('₹2,500 to ₹3,500', False, '27') + wc('₹3,500 to ₹5,000', False, '27'))}
        {fgroup('WEAVE', wc('Kanchipuram', False, '24') + wc('Arani', False, '18') + wc('Banarasi', False, '9'))}
        {fgroup('MORE', wc('Try-on ready', False, '58') + wc('With blouse piece', False, '70'))}
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px 20px; align-content: start">{pcard('maroon', 'Arani silk saree', 'Maroon, temple border', '₹3,150', '₹3,600', '12% OFF', 340, '', 'Just in')}{pcard('violet', 'Kanchipuram silk saree', 'Violet, gold buttas', '₹4,800', '₹5,400', '11% OFF', 340)}{pcard('emerald', 'Kanchipuram silk saree', 'Emerald, pink border', '₹4,950', '₹5,500', '10% OFF', 340)}{pcard('peacock', 'Soft silk saree', 'Peacock blue', '₹2,400', '₹2,800', '14% OFF', 340, '', 'Try-on ready')}{pcard('rust', 'Tussar silk saree', 'Rust, green border', '₹3,900', '₹4,400', '11% OFF', 340)}{pcard('navy', 'Banarasi silk saree', 'Navy, gold brocade', '₹4,950', '₹5,600', '11% OFF', 340)}{pcard('mustard', 'Chettinad cotton saree', 'Mustard, checked border', '₹1,650', '₹1,900', '13% OFF', 340)}{pcard('ivory', 'Kasavu cotton saree', 'Ivory, red border', '₹1,800', '₹2,000', '10% OFF', 340)}</div>
    </div>
  </div>''')


def wbag(k, n, v, p, m, o, note_=''):
    nt = f'<span style="font-size: 12px; font-weight: 600; color: {AMBER}">{note_}</span>' if note_ else ''
    return f'<div style="display: flex; gap: 16px; padding: 16px; border: 1px solid {LINE}; border-radius: 16px; background: #FFFFFF">{pic(k, 96, 120)}<div style="flex: 1; display: flex; flex-direction: column; gap: 4px"><strong style="font-size: 15px; line-height: 22px; font-weight: 700">{n}</strong><span style="font-size: 13px; color: {MUTE}">{v}</span><div style="display: flex; align-items: center; gap: 8px"><span style="{HF}; font-size: 16px; font-weight: 800">{p}</span><span style="font-size: 13px; color: {MUTE}; text-decoration: line-through">{m}</span><span style="font-size: 13px; font-weight: 700; color: {PD}">{o}</span></div><div style="display: flex; align-items: center; gap: 12px; margin-top: auto">{stepper(1)}{nt}<span style="margin-left: auto; display: flex; gap: 16px; font-size: 13px; font-weight: 600; color: {MUTE}"><span>Move to wishlist</span><span>Remove</span></span></div></div></div>'


SUMMARY = acard(h2('Price details', 16) + row('Total MRP (2 items)', '₹5,600') + row('Discount on MRP', '− ₹650', color=GREEN) + row('Delivery', 'FREE', color=GREEN) + SEP + row('Total amount', '₹4,950', True) + f'<span style="font-size: 12px; color: {MUTE}">Prices include all taxes. You save ₹650.</span>', gap=10, pad=20)
boards['WebBag'] = webpage('Alar website bag', 700, f'''
  <div style="padding: 24px 160px 0; display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">{stepdot(1, 'Bag', 'on')}<span style="width: 64px; height: 1px; background: {T2}"></span>{stepdot(2, 'Address', 'todo')}<span style="width: 64px; height: 1px; background: {T2}"></span>{stepdot(3, 'Payment', 'todo')}</div>
    <div style="display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 32px">
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div style="display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 12px; background: {T4}; font-size: 14px">{ic('pin', 18, 2, P)}<span style="flex: 1">Deliver to <strong style="font-weight: 700">Lakshmi, Chennai 600028</strong> · Arrives by Tue, 1 Dec</span><a href="#change" style="font-weight: 600; text-decoration: none">Change</a></div>
        {wbag('maroon', 'Arani silk saree', 'Maroon · With blouse piece · 7 days easy return', '₹3,150', '₹3,600', '12% OFF', 'Only 3 left')}
        {wbag('ivory', 'Kasavu cotton saree', 'Ivory · With blouse piece · 7 days easy return', '₹1,800', '₹2,000', '10% OFF')}
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px">
        <span style="display: flex; align-items: center; gap: 10px; height: 48px; padding: 0 16px; border-radius: 12px; border: 1px dashed {T3}; background: {T4}; font-size: 14px; font-weight: 600">{ic('tag', 18, 2, P)}<span style="flex: 1">Apply coupon</span><span style="font-size: 12px; font-weight: 600; color: {PD}">2 available</span></span>
        {SUMMARY}
        {btn('Place order', h=44)}
        <span style="display: flex; gap: 8px; align-items: center; font-size: 12px; color: {MUTE}">{ic('lock', 14, 2, MUTE)}Pay online by UPI, card or net banking.</span>
      </div>
    </div>
  </div>''', PAGE)

boards['WebCheckout'] = webpage('Alar website checkout', 700, f'''
  <div style="padding: 24px 160px 0; display: flex; flex-direction: column; gap: 16px">
    <div style="display: flex; align-items: center; gap: 12px">{stepdot(1, 'Bag', 'done')}<span style="width: 64px; height: 1px; background: {T2}"></span>{stepdot(2, 'Address', 'done')}<span style="width: 64px; height: 1px; background: {T2}"></span>{stepdot(3, 'Payment', 'on')}</div>
    <div style="display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 32px">
      <div style="display: flex; flex-direction: column; gap: 16px">
        {acard(f'<div style="display: flex; justify-content: space-between; align-items: center">{h2("Deliver to", 16)}<a href="#address" style="font-size: 13px; font-weight: 600; text-decoration: none">Change</a></div><span style="font-size: 14px; line-height: 22px; color: {MUTE}"><strong style="color: {INK}; font-weight: 700">Lakshmi Narayanan</strong> {chip("HOME", tone="lav")}<br>14, 2nd Cross Street, Mandaveli, Chennai, Tamil Nadu 600028 · +91 98400 12345</span><span style="display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600">{ic("truck", 16, 2, P)}Arrives by Tue, 1 Dec · Free delivery</span>', gap=8, pad=20)}
        {acard(h2('Pay with', 16) + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">{paym("UPI", "Scan a QR code or enter your UPI ID", True)}{paym("Credit or debit card", "Visa, Mastercard, RuPay")}{paym("Net banking", "All major banks")}<div style="display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: 1px solid {LINE}; background: #F6F5FA; color: {MUTE}">{radio(False)}<span style="display: flex; flex-direction: column"><strong style="font-size: 14px; font-weight: 600">Cash on delivery</strong><span style="font-size: 12px">Not available yet</span></span></div></div><span style="font-size: 12px; color: {MUTE}">Payments are handled by Razorpay. We hold your items for 15 minutes while you pay.</span>', gap=12, pad=20)}
      </div>
      <div style="display: flex; flex-direction: column; gap: 12px">
        {acard(f'<div style="display: flex; align-items: center; gap: 8px">{pic("maroon", 44, 55, 8)}{pic("ivory", 44, 55, 8)}<span style="flex: 1; font-size: 13px; color: {MUTE}; padding-left: 4px">2 items</span><a href="#bag" style="font-size: 13px; font-weight: 600; text-decoration: none">Edit bag</a></div>', pad=16)}
        {SUMMARY}
        {btn('Pay ₹4,950', icon='lock', h=44)}
        <span style="display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 10px; background: {T4}; font-size: 12px; color: {MUTE}">{ic('clock', 14, 2, P)}Held for you for <strong style="color: {PD}; font-weight: 700">14:20</strong></span>
      </div>
    </div>
  </div>''', PAGE)

boards['WebLogin'] = webpage('Alar website login', 700, f'''
  <div style="position: absolute; inset: 0; background: rgba(27, 21, 48, 0.55); display: flex; align-items: center; justify-content: center">
    <div style="width: 820px; height: 500px; border-radius: 20px; overflow: hidden; background: #FFFFFF; display: flex">
      <div style="width: 360px; position: relative; background: {INK}; flex-shrink: 0">{img('tryon', '80% center')}<div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(27, 21, 48, 0) 40%, rgba(27, 21, 48, 0.85) 100%)"></div><span style="position: absolute; left: 24px; right: 24px; bottom: 24px; color: #FFFFFF; {HF}; font-size: 20px; line-height: 26px; font-weight: 800">See any saree on you before you buy</span></div>
      <div style="flex: 1; padding: 32px; display: flex; flex-direction: column; gap: 16px; position: relative">
        <span style="position: absolute; right: 20px; top: 20px; color: {MUTE}">{ic('close', 20, 2.200)}</span>
        <div style="display: flex; flex-direction: column; gap: 4px">{logo(24)}<h1 style="margin: 0; {HF}; font-size: 22px; line-height: 28px; font-weight: 800">Log in or sign up</h1></div>
        {field('Mobile number', '98400 12345', pre='+91', hint='We will send a 6-digit code by SMS.')}
        {btn('Get OTP')}
        <div style="display: flex; align-items: center; gap: 12px; font-size: 12px; color: {MUTE}"><span style="flex: 1; height: 1px; background: {LINE}"></span>or<span style="flex: 1; height: 1px; background: {LINE}"></span></div>
        <span style="display: inline-flex; align-items: center; justify-content: center; gap: 10px; height: 40px; border-radius: 8px; border: 1px solid {T2}; font-size: 14px; font-weight: 600">{ic('mail', 18, 1.800, P)}Use my email instead</span>
        <span style="margin-top: auto; font-size: 12px; line-height: 18px; color: {MUTE}">By continuing you agree to the Terms of Use and Privacy Policy.</span>
      </div>
    </div>
  </div>''')

# ================================================================== ADMIN, batch 4
def plist(t, s, tag, tone, on=False):
    bd = f'1.500px solid {P}' if on else f'1px solid {LINE}'
    return f'<div style="padding: 10px 12px; border-radius: 10px; border: {bd}; background: {T4 if on else "#FFFFFF"}; display: flex; flex-direction: column; gap: 4px"><div style="display: flex; align-items: center; justify-content: space-between"><strong style="font-size: 13px; font-weight: 700">{t}</strong>{chip(tag, tone=tone)}</div><span style="font-size: 12px; color: {MUTE}">{s}</span></div>'


def ver(v, who, when, what, live=False):
    return f'<div style="display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid {LINE}"><strong style="width: 28px; font-size: 13px; font-weight: 700">{v}</strong><span style="flex: 1; display: flex; flex-direction: column; font-size: 12px; line-height: 18px"><span style="color: {INK}">{what}</span><span style="color: {MUTE}">{who} · {when}</span></span>{chip("LIVE", tone="green") if live else f"<span style=\'font-size: 12px; font-weight: 600; color: {P}\'>Restore</span>"}</div>'


AITABS = ['Models and routing', 'Prompts', 'Safety checks', 'Consent notice', 'Reports 2', 'Usage and cost']
MONO = 'font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 20px'
V = lambda t: f'<span style="color: {PD}; font-weight: 700">{{{{{t}}}}}</span>'
boards['AdminPrompts'] = ('Alar admin prompts', 1440, 900, admin('AI try-on', 'AI try-on controls', abtn('Test with a sample photo', 'ghost', 'spark') + abtn('Publish as version 8', 'primary'), f'''
  {tabs(AITABS, 'Prompts')}
  <div style="display: grid; grid-template-columns: 280px minmax(0, 1fr) 340px; gap: 16px; flex: 1; min-height: 0">
    {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Prompts", 14)}{abtn("New", icon="plus")}</div>' + plist('Saree, Nivi drape', 'Sarees · editing version 8', 'V7 LIVE', 'green', True) + plist('Saree, back view', 'Sarees · second picture', 'DRAFT', 'grey') + plist('Shirt, front', 'Shirts · for later', 'DRAFT', 'grey') + plist('Result check', 'Runs on every result before it is shown', 'V3 LIVE', 'green') + plist('Photo check', 'Adult, one person, clothed', 'V2 LIVE', 'green'), gap=8)}
    {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Saree, Nivi drape · version 8 (draft)", 14)}<span style="font-size: 12px; color: {MUTE}">Saved 2 minutes ago</span></div><div style="flex: 1; border: 1px solid {T2}; border-radius: 10px; padding: 14px; background: {T4}; {MONO}; color: {INK}">Dress the person in the first image in the saree shown in the second image.<br>Keep the face, hair, skin tone, body shape and background exactly as they are.<br>Drape: Nivi style, pallu over the left shoulder, pleats at the front.<br>Copy the saree colour, border and pallu pattern exactly: {V("design.attributes")}.<br>Border metal: {V("design.zari_colour")}. Do not change gold to silver or silver to gold.<br>Blouse: plain, colour {V("design.blouse_colour")}.<br>Full length, head to feet. No text, no watermark, no extra people.<br><span style="background: #E3F4EC; color: {GREEN}">+ Border metal line added in version 8</span></div><div style="display: flex; flex-direction: column; gap: 6px"><span style="font-size: 12px; font-weight: 600">Values you can insert</span><div style="display: flex; flex-wrap: wrap; gap: 6px">{chip("design.attributes", tone="lav")}{chip("design.zari_colour", tone="lav")}{chip("design.blouse_colour", tone="lav")}{chip("design.fabric", tone="lav")}{chip("design.weave", tone="lav")}{chip("category.name", tone="lav")}</div></div><span style="font-size: 12px; line-height: 18px; color: {MUTE}">Safety rules (adults only, one person, no nudity, result check) sit outside the prompt and cannot be edited here.</span>', gap=12)}
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {acard(h2('Test result', 14) + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px"><span style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: {MUTE}"><span style="height: 170px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; display: block">{img("violet")}</span>Version 7</span><span style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: {MUTE}"><span style="height: 170px; border-radius: 10px; overflow: hidden; position: relative; background: {GROUND}; border: 2px solid {P}; box-sizing: border-box; display: block">{img("violet")}</span>Version 8</span></div>' + row('Sample model photo', 'Studio model 2') + row('Cost of this test', '₹5.20'), gap=8)}
      {acard(h2('History', 14) + ver('v7', 'Arun', '26 Nov', 'Pleats and pallu side made explicit', True) + ver('v6', 'Arun', '19 Nov', 'Blouse colour taken from the design') + ver('v5', 'Arun', '12 Nov', 'Background kept unchanged'), gap=0)}
    </div>
  </div>'''))


def yes(v):
    if v is True:
        return f'<span style="width: 20px; height: 20px; border-radius: 999px; background: #E3F4EC; color: {GREEN}; display: inline-flex; align-items: center; justify-content: center">{ic("check", 12, 3)}</span>'
    if v is False:
        return f'<span style="width: 12px; height: 2px; background: #CFCBDD"></span>'
    return chip(v, tone='grey')


PERMS = [('See orders', True, True, True, True), ('Pack, ship and print labels', True, False, True, False), ('Cancel and refund', True, False, False, 'ASK OWNER'),
         ('Add and edit products', True, True, False, False), ('Change prices', True, False, False, False), ('Change stock', True, True, True, False),
         ('See cost and weaver', True, True, False, False), ('Edit app content', True, True, False, False), ('See customer details', True, False, 'ADDRESS ONLY', True),
         ('AI settings and prompts', True, False, False, False), ('Staff, roles and settings', True, False, False, False)]
boards['AdminRoles'] = ('Alar admin roles', 1440, 900, admin('Customers', 'Customers and staff', abtn('New role', 'ghost', 'plus') + abtn('Invite staff', 'primary', 'plus'), f'''
  {tabs(['Customers 1,284', 'Staff 3', 'Roles', 'Deletion requests 1', 'Audit log'], 'Roles')}
  <div style="display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 12px; min-width: 0">
      {table(['What they can do', 'Owner', 'Catalogue', 'Packing', 'Support'], [[bold(p[0])] + [yes(x) for x in p[1:]] for p in PERMS], ['2.200fr', '1fr', '1fr', '1fr', '1fr'])}
      <span style="font-size: 12px; color: {MUTE}">No role can see a shopper's try-on photo. Changes to roles are written to the audit log.</span>
    </div>
    {acard(h2('Invite staff', 16) + afield('Name', 'Priya S.') + afield('Work email', 'priya@alar.example') + afield('Mobile for sign-in codes', '+91 90000 00000') + afield('Role', 'Support', sel=True) + tog('Ask for a code on every sign-in', True, 'Always on for all staff') + note('mail', 'They get an email link that works for 48 hours and set their own password.') + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: auto">{abtn("Cancel")}{abtn("Send invite", "primary")}</div>', gap=10)}
  </div>'''))


def SETNAV(on):
    return acard(''.join(snav(t, t == on) for t in ['Store and brand', 'Payments', 'Delivery', 'Taxes and invoices', 'Returns', 'Messages', 'Legal pages', 'Dated legal values', 'Backups']), gap=4, pad=8)


def ch(t):
    return chip(t, tone={'SMS': 'grey', 'WHATSAPP': 'green', 'PUSH': 'lav', 'EMAIL': 'amber'}[t])


boards['AdminMessages'] = ('Alar admin messages', 1440, 900, admin('Settings', 'Settings', abtn('Send a test to my phone', 'ghost', 'phone') + abtn('Save changes', 'primary'), f'''
  <div style="display: grid; grid-template-columns: 200px minmax(0, 1fr) 380px; gap: 16px; flex: 1; min-height: 0">
    {SETNAV('Messages')}
    <div style="display: flex; flex-direction: column; gap: 12px; min-width: 0">
      {table(['Message', 'Sent when', 'Channels', 'Languages', 'On'], [
        [bold('Sign-in code'), 'Shopper asks for an OTP', ch('SMS'), '5', toggle(True)],
        [bold('Order confirmed'), 'Payment confirmed by Razorpay', ch('SMS') + ch('PUSH') + ch('EMAIL'), '5', toggle(True)],
        [bold('Order shipped'), 'Courier picks up the parcel', ch('SMS') + ch('PUSH'), '5', toggle(True)],
        [bold('Out for delivery'), 'Courier marks it', ch('PUSH'), '5', toggle(True)],
        [bold('Refund sent'), 'Refund leaves Razorpay', ch('SMS') + ch('EMAIL'), '5', toggle(True)],
        [bold('Try-on ready'), 'Result passes the check', ch('PUSH'), '5', toggle(True)]],
        ['1.200fr', '1.300fr', '2.300fr', '0.600fr', '0.400fr'])}
      <span style="font-size: 12px; color: {MUTE}">Offer messages go only to shoppers who said yes. SMS wording must match the template registered with the telecom operator.</span>
    </div>
    {acard(h2('Order shipped', 16) + f'<div style="display: flex; gap: 6px">{chip("English", True)}{chip("தமிழ்")}{chip("తెలుగు")}{chip("ಕನ್ನಡ")}{chip("മലയാളം")}</div>' + afield('SMS text', f'<span>Hi {V("customer.first_name")}, your Alar order {V("order.number")} is on the way. It should reach you by {V("order.eta")}. Track it here: {V("order.track_link")}</span>', 96) + f'<span style="font-size: 12px; font-weight: 600">Preview</span><div style="background: #E9F7EF; border-radius: 12px 12px 12px 4px; padding: 10px 12px; font-size: 13px; line-height: 20px; max-width: 290px">Hi Lakshmi, your Alar order AL-2611-00418 is on the way. It should reach you by Tue, 1 Dec. Track it here: alar.example/t/00418</div>' + row('Sent last 7 days', bold('61')) + row('Delivered', bold('98%')) + note('shield', 'The store name in messages comes from Settings, Store and brand.'), gap=10)}
  </div>'''))

boards['AdminLegal'] = ('Alar admin legal', 1440, 900, admin('Settings', 'Settings', abtn('Save changes', 'primary'), f'''
  <div style="display: grid; grid-template-columns: 200px minmax(0, 1.150fr) minmax(0, 1fr); gap: 16px; flex: 1; min-height: 0">
    {SETNAV('Legal pages')}
    <div style="display: flex; flex-direction: column; gap: 12px; min-width: 0">
      {table(['Page', 'Version', 'Status', 'Last edited', ''], [
        [bold('Terms of Use'), 'Draft 1', chip('LAWYER REVIEW', tone='amber'), mute('27 Nov'), mute(ic('edit', 16, 2))],
        [bold('Privacy Policy'), 'Draft 1', chip('LAWYER REVIEW', tone='amber'), mute('27 Nov'), mute(ic('edit', 16, 2))],
        [bold('Try-on photo notice'), 'v3', chip('LIVE', tone='green'), mute('20 Nov'), mute(ic('edit', 16, 2))],
        [bold('Returns, refunds and cancellation'), 'Draft 1', chip('LAWYER REVIEW', tone='amber'), mute('27 Nov'), mute(ic('edit', 16, 2))],
        [bold('Shipping policy'), 'Draft 1', chip('LAWYER REVIEW', tone='amber'), mute('27 Nov'), mute(ic('edit', 16, 2))],
        [bold('Grievance redressal'), 'Draft 1', chip('NEEDS OFFICER NAME', tone='red'), mute('27 Nov'), mute(ic('edit', 16, 2))]],
        ['1.900fr', '0.600fr', '1.500fr', '0.700fr', '24px'])}
      {note('alert', '14 blanks are still to be filled across these pages (company name, registered address, GSTIN, grievance officer and others). The store cannot go live while any blank remains.', 'amber')}
      <span style="font-size: 12px; color: {MUTE}">Publishing a new version of the Terms or the Privacy Policy shows shoppers a notice at next sign-in. Every published version is kept.</span>
    </div>
    {acard(f'<div style="display: flex; align-items: center; justify-content: space-between">{h2("Dated legal values", 14)}{abtn("Add value", icon="plus")}</div>' + table(['Value', 'Now', 'From', 'Next'], [
        [bold('Return window'), '7 days', '1 Nov 2026', mute('None')],
        [bold('Grievance reply time'), '48 hours', '1 Nov 2026', mute('None')],
        [bold('Try-on photo kept'), '30 days unused', '1 Nov 2026', mute('None')],
        [bold('Minimum age for try-on'), '18', '1 Nov 2026', mute('None')],
        [bold('Data request reply time'), '7 days', '1 Nov 2026', mute('To recheck 13 May 2027')],
        [bold('Invoice kept for'), '8 years', '1 Nov 2026', mute('None')]],
        ['1.600fr', '1fr', '1fr', '1.300fr']) + f'<span style="font-size: 12px; line-height: 18px; color: {MUTE}">The app, the notices and the checks all read these values from here, so a change in the law is a new dated line, not a new app release. Values shown are drafts for the lawyer and accountant to confirm.</span>', gap=10)}
  </div>'''))

boards['AdminConsent'] = ('Alar admin consent notice', 1440, 900, admin('AI try-on', 'AI try-on controls', abtn('Preview in app', 'ghost', 'eye') + abtn('Publish version 4', 'primary'), f'''
  {tabs(AITABS, 'Consent notice')}
  <div style="display: grid; grid-template-columns: minmax(0, 1fr) 420px; gap: 16px; flex: 1; min-height: 0">
    <div style="display: flex; flex-direction: column; gap: 16px; min-width: 0">
      {table(['Version', 'In force', 'AI services named', 'Shoppers agreed', 'Status'], [
        [bold('v4'), mute('Not yet'), 'Google, OpenAI, FASHN', mute('0'), chip('DRAFT', tone='grey')],
        [bold('v3'), '20 Nov 2026', 'Google, OpenAI', '1,104', chip('LIVE', tone='green')],
        [bold('v2'), '8 Nov to 20 Nov', 'Google', '41 still on this', chip('REPLACED', tone='grey')],
        [bold('v1'), '1 Nov to 8 Nov', 'Google', '0 still on this', chip('REPLACED', tone='grey')]],
        ['0.600fr', '1.200fr', '1.600fr', '1.100fr', '0.800fr'])}
      {acard(h2('Consent records', 14) + '<div style="display: flex; gap: 32px">' + ''.join(f'<span style="display: flex; flex-direction: column"><strong style="{HF}; font-size: 20px; font-weight: 800">{v}</strong><span style="font-size: 12px; color: {MUTE}">{t}</span></span>' for v, t in [('1,145', 'Agreed, any version'), ('37', 'Withdrew'), ('41', 'Must agree again'), ('0', 'Try-ons without a record')]) + f'</div><span style="font-size: 12px; line-height: 18px; color: {MUTE}">Each record holds the shopper, the version, the language shown, the date and time, and the app version. Records are kept after withdrawal as proof; the photo is not.</span>')}
    </div>
    {acard(h2('Version 4 (draft)', 16) + f'<span style="font-size: 12px; font-weight: 600">What changes from version 3</span><div style="border: 1px solid {T2}; border-radius: 10px; padding: 12px; background: {T4}; font-size: 13px; line-height: 20px"><strong style="font-weight: 700">Who receives it</strong><br>Our AI service providers: Google, OpenAI <span style="background: #E3F4EC; color: {GREEN}; font-weight: 600">and FASHN</span>, reached through OpenRouter <span style="background: #E3F4EC; color: {GREEN}; font-weight: 600">or directly</span>.</div>' + f'<div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px">{row("Languages ready", "5 of 5")}{row("Lawyer approval", f"<span style=\'font-weight: 600; color: {AMBER}\'>Not recorded</span>")}{row("Comes into force", "On publish")}</div>' + note('alert', 'Publishing asks all 1,104 shoppers on version 3 to agree again before their next try-on. FASHN stays switched off until this version is live.', 'amber') + afield('Approved by (name and date)', '', 36, hint='Needed before Publish is allowed.') + f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: auto">{abtn("Edit wording")}{abtn("Compare all text")}</div>', gap=10)}
  </div>'''))

EXTRA_T = dict(ExchangeColour='Exchange for another colour', Reviews='Ratings and reviews', Coupons='Coupons', EditProfile='Edit profile', Language='Language', NoInternet='No internet',
               ConsentNotice='Try-on notice, full text', DeleteAccount='Delete account', SizeChart='Size chart (shirts)',
               WebListing='Website: listing with filters', WebBag='Website: bag', WebCheckout='Website: checkout', WebLogin='Website: login',
               AdminPrompts='Admin: AI prompts', AdminRoles='Admin: roles', AdminMessages='Admin: messages', AdminLegal='Admin: legal pages and dated values', AdminConsent='Admin: consent notice versions')
EXTRA_ROWS = {'1': ['NoInternet'], '2': ['SizeChart'], '3': ['ConsentNotice'], '4': ['Coupons'], '5': ['EditProfile', 'Language', 'DeleteAccount'],
              '6': ['WebListing', 'WebBag', 'WebCheckout', 'WebLogin'], '7': ['AdminPrompts', 'AdminConsent', 'AdminMessages', 'AdminLegal']}

# ------------------------------------------------------------------ write files + canvas
for name, (title, w, h, inner) in boards.items():
    open(os.path.join(OUT, name + '.dc.html'), 'w').write(page(title, w, h, inner))

c = json.load(open(os.path.join(OUT, 'canvas.json')))
old = c['boards']
T = dict(Onboarding='Onboarding', Login='Log in or sign up', Otp='OTP check', SignUp='Sign up details',
         Main='Home', Listing='Category listing', Product='Saree page', Shirt='Shirt page (later category)', Consent='Try-on consent', Theme='Theme',
         Categories='Categories tab', Search='Search', Filters='Filters', Wishlist='Wishlist',
         FullSaree='Full saree view', TryOnPhoto='Try-on: choose photo', TryOnWait='Try-on: in progress', TryOnResult='Try-on result', TryOnProblem='Try-on: photo not usable', TryOnHub='Try-on tab',
         Bag='Bag', EmptyBag='Bag, empty', Checkout='Checkout', PaymentFailed='Payment failed', OrderPlaced='Order confirmed', Orders='My orders', OrderDetail='Order detail',
         Profile='Profile', Addresses='Addresses', AddAddress='Add address', Notifications='Notifications', Privacy='Privacy and consent', Help='Help',
         ReturnReason='Return: reason', ReturnConfirm='Return: pickup and refund', Review='Rate and review',
         WebHome='Website: home', WebProduct='Website: saree page',
         AdminLogin='Admin: sign in', AdminDashboard='Admin: dashboard', AdminProducts='Admin: products', AdminProductEdit='Admin: product, variants and stock',
         AdminInventory='Admin: stock', AdminCategories='Admin: categories and attributes', AdminOrders='Admin: orders', AdminReturns='Admin: returns and refunds',
         AdminOffers='Admin: offers and coupons', AdminContent='Admin: app content', AdminAI='Admin: AI try-on controls', AdminAIReports='Admin: AI reports and cost',
         AdminCustomers='Admin: customers and staff', AdminAudit='Admin: audit log', AdminSettings='Admin: settings', Media='Generated media')
ROWS = [
    ('1. Getting in: login (mobile code, or email code), sign up', ['Login', 'Otp', 'SignUp']),
    ('2. Browsing: home, categories, search, listing, filters, product pages, wishlist', ['Main', 'Categories', 'Search', 'Listing', 'Filters', 'Product', 'Shirt', 'Wishlist']),
    ('3. Try-on', ['Consent', 'TryOnPhoto', 'TryOnWait', 'TryOnResult', 'TryOnProblem', 'TryOnHub', 'FullSaree']),
    ('4. Bag, checkout and orders', ['Bag', 'EmptyBag', 'Checkout', 'PaymentFailed', 'OrderPlaced', 'Orders', 'OrderDetail', 'ReturnReason', 'ReturnConfirm', 'Review']),
    ('5. Account', ['Profile', 'Addresses', 'AddAddress', 'Notifications', 'Privacy', 'Help']),
    ('6. Website (1440 wide)', ['WebHome', 'WebProduct']),
    ('7. Admin (web, 1440 wide)', ['AdminLogin', 'AdminDashboard', 'AdminProducts', 'AdminProductEdit', 'AdminInventory', 'AdminCategories', 'AdminOrders', 'AdminReturns',
                                    'AdminOffers', 'AdminContent', 'AdminAI', 'AdminAIReports', 'AdminCustomers', 'AdminAudit', 'AdminSettings']),
    ('8. Theme and generated media', ['Theme', 'Media']),
    ('9. Designed for a later version, not in the first release', ['Onboarding', 'Reviews', 'ExchangeColour', 'AdminRoles']),
]
T.update(EXTRA_T)
ROWS = [(l, n + EXTRA_ROWS.get(l[0], [])) for l, n in ROWS]
nb, order, notes, y = {}, [], {'heading': {'x': 0, 'y': -340, 'text': 'Alar: lavender theme, all screens', 'kind': 'title1', 'maxW': 3390}}, 0
for ri, (label, names) in enumerate(ROWS):
    notes[f'r{ri}'] = {'x': 0, 'y': y - 110, 'text': label, 'kind': 'title2', 'maxW': 5000}
    x, rowh, per = 0, 0, (4 if names[0].startswith('Admin') else 99)
    for i, n in enumerate(names):
        f = n + '.dc.html'
        w, h = (old[f]['w'], old[f]['h']) if f in old and n not in boards else (boards[n][1], boards[n][2])
        if i and i % per == 0:
            x, y = 0, y + rowh + 120
            rowh = 0
        nb[f] = dict(x=x, y=y, w=w, h=h, title=T[n], radius=32 if w == 390 else 16)
        order.append(f)
        x += w + 80
        rowh = max(rowh, h)
    y += rowh + 300
c['boards'], c['order'], c['notes'] = nb, order, notes
json.dump(c, open(os.path.join(OUT, 'canvas.json'), 'w'), indent=2)
missing = [f for f in old if f not in nb]
print(len(boards), 'boards built;', len(nb), 'on canvas; missing from layout:', missing)
