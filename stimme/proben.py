# Erzeugt Hörproben verschiedener kostenloser deutscher Stimmen mit demselben Text (ohne Video):
#   /tmp/cb/bin/python stimme/proben.py <zielordner> <piper-stimmen-ordner>
# Nur Stimmen mit freier Lizenz: Thorsten (CC0), Kerstin (CC0), MLS (CC BY 4.0, Namensnennung nötig).
# Varianten: Piper direkt (schnell, etwas technischer) und Chatterbox (natürlicher) mit verschiedenen Vorlagen-Stimmen.
import sys, os, subprocess, wave
import torch, torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS
from piper import PiperVoice

out, vdir = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
here = os.path.dirname(os.path.abspath(__file__))
TEXT = ['Ein ganzer Tag. So lange braucht jetzt ein Funkspruch zu dieser Sonde.',
        'Voyager eins ist laut NASA einen Lichttag von der Erde entfernt.',
        'So weit ist noch nie etwas gekommen, das Menschen gebaut haben.']

def piper(model, path, speaker=None):
    v = PiperVoice.load(os.path.join(vdir, model))
    with wave.open(path, 'wb') as w:
        from piper import SynthesisConfig
        v.synthesize_wav(' '.join(TEXT), w, syn_config=SynthesisConfig(speaker_id=speaker) if speaker is not None else None)

def speed(src, dst, tempo=1.15):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', f'atempo={tempo},loudnorm=I=-16', '-ar', '44100', dst], check=True)

# Vorlagen für Chatterbox aus den Piper-Stimmen erzeugen
piper('de_DE-kerstin-low.onnx', os.path.join(out, 'ref-kerstin.wav'))
piper('de_DE-mls-medium.onnx', os.path.join(out, 'ref-mls.wav'), speaker=10)

# Piper direkt
for name, model, spk in [('5-piper-thorsten', 'de_DE-thorsten-high.onnx', None), ('6-piper-kerstin', 'de_DE-kerstin-low.onnx', None),
                         ('7-piper-mls-maennlich', 'de_DE-mls-medium.onnx', 10)]:
    raw = os.path.join(out, name + '-roh.wav'); piper(model, raw, spk); speed(raw, os.path.join(out, name + '.mp3'), 1.0); os.remove(raw)

m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
def cb(name, ref, exaggeration=0.4, cfg=0.4):
    parts = []
    for line in TEXT:
        parts += [m.generate(line, language_id='de', audio_prompt_path=ref, exaggeration=exaggeration, cfg_weight=cfg), torch.zeros(1, int(m.sr * 0.4))]
    raw = os.path.join(out, name + '-roh.wav'); ta.save(raw, torch.cat(parts, 1), m.sr); speed(raw, os.path.join(out, name + '.mp3')); os.remove(raw)

cb('1-aktuell-thorsten', os.path.join(here, 'referenz.wav'))
cb('2-thorsten-dramatisch', os.path.join(here, 'referenz.wav'), exaggeration=0.7, cfg=0.3)
cb('3-kerstin-natuerlich', os.path.join(out, 'ref-kerstin.wav'))
cb('4-mls-natuerlich', os.path.join(out, 'ref-mls.wav'))
print('Proben ->', out)
