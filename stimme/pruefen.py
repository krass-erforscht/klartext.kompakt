# Prüft ein fertiges Video vor dem Posten komplett (Pflicht für erzählte Videos):
#   /tmp/cb/bin/python stimme/pruefen.py <video.mp4> <sprechtext.txt> [<bogen.jpg>]
# - hört das ganze Video mit Whisper ab und vergleicht jeden Satz mit dem Sprechtext (Zahlen streng),
# - meldet Aussetzer: Pausen über 0,9 s mitten im Text und abgeschnittene Satzenden,
# - legt einen Bogen mit 12 Standbildern an (Bild ansehen: Text lesbar, nichts abgeschnitten, Szene passt).
# Ende: „PRÜFUNG OK“ oder „PRÜFUNG FEHLER: …“ (Exit-Code 1). Nur bei OK posten.
import sys, os, re, json, difflib, subprocess, tempfile, wave
import numpy as np
from faster_whisper import WhisperModel

here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'sprechen.py'), encoding='utf-8').read()
exec(src[src.index('NUM = re.compile'):src.index('def check')])  # dieselben Zahlen-Regeln wie bei der Aufnahme

video, text = sys.argv[1], sys.argv[2]
sheet = sys.argv[3] if len(sys.argv) > 3 else os.path.splitext(video)[0] + '-pruefung.jpg'
lines = [l.strip() for l in open(text, encoding='utf-8') if l.strip()]

tmp = tempfile.mktemp(suffix='.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-ac', '1', '-ar', '16000', tmp], check=True)
w = wave.open(tmp); audio = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
dur = len(audio) / 16000
ear = WhisperModel('small', device='cpu', compute_type='int8')
segs, _ = ear.transcribe(audio, language='de', word_timestamps=True)
ws = [x for s in segs for x in (s.words or [])]
os.remove(tmp)

fehler = []
# 1) Gesamter Text: jeder Satz muss vollständig vorkommen (in Reihenfolge)
heard = norm(' '.join(x.word for x in ws))
pos = 0
for l in lines:
    exp = [x for x in norm(l) if x not in ('und', 'ein', 'eine')]
    best, bi = 0, pos
    for i in range(pos, max(pos + 1, len(heard) - len(exp) + 1)):
        win = [x for x in heard[i:i + len(exp) + 3] if x not in ('und', 'ein', 'eine')][:len(exp)]
        r = difflib.SequenceMatcher(None, ''.join(exp), ''.join(win)).ratio()
        if r > best: best, bi = r, i
    if best < 0.8: fehler.append(f'Satz unvollständig oder falsch ({best:.2f}): „{l}“')
    # Zahlen streng: jede Zahl des Satzes muss vollständig gesprochen sein
    zn = lambda ts: ''.join(x for x in ts if NUM.match(x) and x not in ('und', 'ein', 'eine')).replace('und', '')
    win = heard[bi:bi + len(norm(l)) + 3]
    if zn(norm(l)) and zn(norm(l)) not in zn(win): fehler.append(f'Zahl fehlt oder abgeschnitten: „{l}“ (gehört: „{" ".join(win)}“)')
    pos = bi + max(1, len(exp) - 2)
# 2) Aussetzer: lange Pausen zwischen Wörtern
for p, q in zip(ws, ws[1:]):
    if q.start - p.end > 0.9: fehler.append(f'Pause {q.start - p.end:.1f} s bei {p.end:.1f} s (nach „{p.word.strip()}“)')
# 3) Ende: letzter Satz muss vor Videoende fertig sein
if ws and ws[-1].end > dur - 0.2: fehler.append(f'Stimme endet erst bei {ws[-1].end:.1f} s, Video ist {dur:.1f} s lang (abgeschnitten?)')

subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', video, '-vf', f'fps=12/{dur:.2f},scale=270:-2,tile=6x2', '-frames:v', '1', sheet], check=True)
print('Gehört:', ' '.join(x.word.strip() for x in ws))
print('Standbilder:', sheet)
if fehler:
    print('PRÜFUNG FEHLER:'); [print(' -', f) for f in fehler]; sys.exit(1)
print('PRÜFUNG OK')
