"""Render the simple vector geometry in Assets/ZaloDesk.svg as a Windows ICO.
Requires Pillow. No network assets or fonts are used.
"""
from pathlib import Path
from PIL import Image, ImageDraw

assets = Path(__file__).resolve().parent.parent / 'Assets'
scale = 16
image = Image.new('RGBA', (128 * scale, 128 * scale))
draw = ImageDraw.Draw(image)
def box(coords):
    return tuple(round(x * scale) for x in coords)
draw.rounded_rectangle(box((4, 4, 124, 124)), radius=28 * scale, fill='#0866ff')
for x, y in [(29, 29), (72, 29), (29, 72)]:
    draw.rounded_rectangle(box((x, y, x + 27, y + 27)), radius=7 * scale, fill='white')
for coords in [(74, 81, 97, 90), (81, 74, 90, 97)]:
    draw.rounded_rectangle(box(coords), radius=4.5 * scale, fill='white')
image = image.resize((256, 256), Image.Resampling.LANCZOS)
image.save(assets / 'ZaloDesk.png')
image.save(assets / 'ZaloDesk.ico', sizes=[(n, n) for n in (16, 20, 24, 32, 40, 48, 64, 128, 256)])
print('Created ZaloDesk.png and ZaloDesk.ico (16–256 px).')
