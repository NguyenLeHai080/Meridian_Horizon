import os
from PIL import Image, ImageDraw

def create_peipei_icon():
    os.makedirs('resources', exist_ok=True)
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. Dark Rounded App Squircle Background
    # Outer dark obsidian squircle with neon emerald glow
    padding = 24
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=110,
        fill=(11, 15, 23, 255),
        outline=(16, 185, 129, 255),
        width=10
    )

    # Subtle inner gradient ring
    inner_pad = padding + 8
    draw.rounded_rectangle(
        [inner_pad, inner_pad, size - inner_pad, size - inner_pad],
        radius=100,
        outline=(6, 182, 212, 120),
        width=4
    )

    # 2. Panda Ears
    # Left Ear
    draw.ellipse([120, 110, 210, 200], fill=(22, 27, 38, 255), outline=(16, 185, 129, 200), width=5)
    # Right Ear
    draw.ellipse([302, 110, 392, 200], fill=(22, 27, 38, 255), outline=(16, 185, 129, 200), width=5)

    # 3. Panda Head Face (White/Light cream)
    draw.ellipse([136, 140, 376, 380], fill=(248, 250, 252, 255), outline=(203, 213, 225, 255), width=4)

    # 4. Panda Eye Patches (Black/Dark slate tilted ovals)
    draw.ellipse([165, 210, 235, 290], fill=(15, 23, 42, 255))
    draw.ellipse([277, 210, 347, 290], fill=(15, 23, 42, 255))

    # Eye pupils (Bright Cyan glowing eyes)
    draw.ellipse([188, 235, 212, 265], fill=(6, 182, 212, 255))
    draw.ellipse([300, 235, 324, 265], fill=(6, 182, 212, 255))
    # Eye highlights
    draw.ellipse([194, 240, 202, 248], fill=(255, 255, 255, 255))
    draw.ellipse([306, 240, 314, 248], fill=(255, 255, 255, 255))

    # 5. Panda Nose & Mouth
    draw.ellipse([238, 285, 274, 310], fill=(30, 41, 59, 255))
    draw.arc([238, 305, 274, 335], start=20, end=160, fill=(30, 41, 59, 255), width=5)

    # 6. Neon Headphones Arch & Earcups (Cyber style)
    # Headband
    draw.arc([100, 75, 412, 280], start=185, end=355, fill=(16, 185, 129, 255), width=18)
    draw.arc([110, 85, 402, 290], start=185, end=355, fill=(6, 182, 212, 200), width=8)

    # Left Earcup
    draw.rounded_rectangle([92, 195, 138, 295], radius=22, fill=(16, 185, 129, 255), outline=(6, 182, 212, 255), width=6)
    # Right Earcup
    draw.rounded_rectangle([374, 195, 420, 295], radius=22, fill=(16, 185, 129, 255), outline=(6, 182, 212, 255), width=6)

    # Save PNG
    png_path = 'resources/icon.png'
    img.save(png_path, 'PNG')
    print(f"Saved PNG to {png_path}")

    # Save Multi-resolution ICO
    ico_path = 'resources/icon.ico'
    icon_sizes = [(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)]
    img.save(ico_path, format='ICO', sizes=icon_sizes)
    print(f"Saved ICO to {ico_path}")

if __name__ == '__main__':
    create_peipei_icon()
