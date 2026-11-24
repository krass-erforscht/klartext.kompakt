# Doku-Sprecherstimme „C“ (vom Nutzer gewählt): Chatterbox Multilingual (MIT-Lizenz) mit der Klangfarbe
# der freien Thorsten-Stimme (CC0, Piper) als Vorlage in stimme/referenz.wav. Kostenlos, läuft auf der CPU.
# Jeder Satz wird nach dem Sprechen automatisch abgehört (Whisper, MIT-Lizenz): Hat die Stimme Silben dazuerfunden
# oder Wörter verschluckt, wird der Satz neu gesprochen (bis zu 5 Versuche, der beste wird genommen),
# und Geräusche nach dem letzten Wort werden abgeschnitten.
# Einmalig einrichten (ca. 5 Minuten):
#   python3 -m venv /tmp/cb && /tmp/cb/bin/pip install -q --index-url https://download.pytorch.org/whl/cpu torch torchaudio
#   /tmp/cb/bin/pip install -q chatterbox-tts faster-whisper
# Aufruf: /tmp/cb/bin/python stimme/sprechen.py <text.txt> <ziel.wav>   (legt <ziel>.json mit den Satz-Zeiten daneben)
#   text.txt: ein Satz pro Zeile; Leerzeile = längere Pause (neuer Absatz). Zahlen ausschreiben, sehr kurze Sätze vermeiden.
import sys, os, re, json, difflib, torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from faster_whisper import WhisperModel

TRIES, GOOD = 4, 0.85
src, out = sys.argv[1], sys.argv[2]
ref = os.path.join(os.path.dirname(__file__), 'referenz.wav')
m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
ear = WhisperModel('small', device='cpu', compute_type='int8')
# Zahlen: Whisper schreibt sie meist als Ziffern („1977“), im Sprechtext stehen sie als Wörter.
# Darum werden gehörte Ziffern in deutsche Zahlwörter umgewandelt und Zahlen streng verglichen:
# Fehlt ein Teil („neunzehnhundert“ statt „neunzehnhundertsiebenundsiebzig“), wird der Satz neu gesprochen.
NUM = re.compile(r'^(und|ein|eins|eine|zwei|drei|vier|fünf|sechs|sech|sieben|sieb|acht|neun|zehn|elf|zwölf|zwan|zig|ßig|hundert|tausend|millionen?|milliarden?|komma)+$')
EINS = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn',
        'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn']
ZEHN = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']

def zahl(n):
    if n < 20: return EINS[n]
    if n < 100: e, z = n % 10, n // 10; return ZEHN[z] if not e else ('ein' if e == 1 else EINS[e]) + 'und' + ZEHN[z]
    if n < 1000: h, r = divmod(n, 100); return ('ein' if h == 1 else EINS[h]) + 'hundert' + (zahl(r) if r else '')
    if 1100 < n < 2000:  # Jahreszahlen wie 1977
        return zahl(n // 100) + 'hundert' + (zahl(n % 100) if n % 100 else '')
    if n < 1000000: t, r = divmod(n, 1000); return ('ein' if t == 1 else zahl(t)) + 'tausend' + (zahl(r) if r else '')
    return str(n)

def norm(s):
    s = s.lower().replace('.', ' ')
    s = re.sub(r'(\d+)\s*,\s*(\d+)', lambda m: zahl(int(m.group(1))) + ' komma ' + ' '.join(zahl(int(d)) for d in m.group(2)), s)
    s = re.sub(r'\d+', lambda m: zahl(int(m.group(0))), s)
    return re.findall(r'[a-zäöüß]+', s)

def words(s):
    return [x for x in norm(s) if not NUM.match(x)]

def nums(s):
    return [x for x in norm(s) if NUM.match(x) and x not in ('und', 'ein', 'eine')]

def check(line, wav):
    a = ta.functional.resample(wav, m.sr, 16000)[0].numpy()
    segs, _ = ear.transcribe(a, language='de', word_timestamps=True)
    ws = [w for s in segs for w in (s.words or [])]
    heard = ' '.join(w.word for w in ws)
    exp, hyp = words(line), words(heard)
    score = difflib.SequenceMatcher(None, exp, hyp).ratio() if exp else 1.0
    # Zahlen müssen vollständig gesprochen sein
    if ''.join(nums(line)).replace('und', '') != ''.join(nums(heard)).replace('und', ''): score = min(score, 0.6)
    # Pausen mitten im Satz (ohne Komma an der Stelle) klingen wie ein Aussetzer
    gaps = sum(1 for p, q in zip(ws, ws[1:]) if q.start - p.end > 0.4)
    if gaps > len(re.findall(r'[,;:–-]', line)): score -= 0.15
    end = ws[-1].end + 0.2 if ws else wav.shape[1] / m.sr
    return score, heard, end

parts, times, pos = [], [], 0.0
for line in open(src, encoding='utf-8').read().split('\n'):
    line = line.strip()
    if not line:
        parts.append(torch.zeros(1, int(m.sr * 0.5))); pos += 0.5
        continue
    best = None
    for i in range(TRIES):
        w = m.generate(line, language_id='de', audio_prompt_path=ref, exaggeration=0.4, cfg_weight=0.4)
        score, heard, end = check(line, w)
        if not best or score > best[0]: best = (score, w, heard, end)
        if score >= GOOD: break
        print(f'  Versuch {i + 1} ({score:.2f}): „{heard.strip()}“', file=sys.stderr)
    score, w, heard, end = best
    w = w[:, :min(w.shape[1], int(end * m.sr))]  # Geräusche nach dem letzten Wort abschneiden
    if score < GOOD: print(f'WARNUNG ({score:.2f}): „{line}“ klingt wie „{heard.strip()}“', file=sys.stderr)
    times.append({'text': line, 'start': round(pos, 2), 'end': round(pos + w.shape[1] / m.sr, 2), 'score': round(score, 2)})
    pos += w.shape[1] / m.sr + 0.45
    parts += [w, torch.zeros(1, int(m.sr * 0.45))]
ta.save(out, torch.cat(parts, 1), m.sr)
# Zeitpunkte der Sätze für Untertitel
json.dump(times, open(out.rsplit('.', 1)[0] + '.json', 'w'), ensure_ascii=False, indent=1)
print(f'Sprechertext ({pos:.1f} s) -> {out}')
