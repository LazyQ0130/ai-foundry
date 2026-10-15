"""把品牌板里的横向 Logo 与 FY 工作室 logo 抠成透明底 PNG。"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))


def transparent_from_bg(im, tol=40):
    """把接近背景色的像素变透明，并反解出前景真实颜色（去白底）。"""
    im = im.convert('RGB')
    W, H = im.size
    px = im.load()
    corners = [px[0, 0], px[W - 1, 0], px[0, H - 1], px[W - 1, H - 1]]
    br = sum(c[0] for c in corners) / 4
    bg = (br, sum(c[1] for c in corners) / 4, sum(c[2] for c in corners) / 4)

    out = Image.new('RGBA', (W, H))
    op = out.load()
    for y in range(H):
        for x in range(W):
            r, g, b = px[x, y]
            d = max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2]))
            a = 0 if d < 6 else (255 if d >= tol else int(d / tol * 255))
            if a == 0:
                op[x, y] = (0, 0, 0, 0)
                continue
            k = a / 255
            # 反预乘：p = k*fg + (1-k)*bg  =>  fg = (p - (1-k)*bg)/k
            fr = min(255, max(0, int((r - (1 - k) * bg[0]) / k)))
            fg_ = min(255, max(0, int((g - (1 - k) * bg[1]) / k)))
            fb = min(255, max(0, int((b - (1 - k) * bg[2]) / k)))
            op[x, y] = (fr, fg_, fb, a)
    return out


def trim(im, pad=6, thresh=8):
    bbox = im.split()[-1].point(lambda v: 255 if v > thresh else 0).getbbox()
    if not bbox:
        return im
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - pad); y0 = max(0, y0 - pad)
    x1 = min(im.width, x1 + pad); y1 = min(im.height, y1 + pad)
    return im.crop((x0, y0, x1, y1))


# 1) AIFoundry 横向 Logo
board = Image.open(os.path.join(ROOT, 'public', 'brand-board.png')).convert('RGB')
lock = board.crop((214, 226, 1230, 435))          # 顶部 PRIMARY LOGO 区域
lock = trim(transparent_from_bg(lock))
lock.save(os.path.join(HERE, 'aifoundry-lockup.png'))
print('lockup', lock.size)

# 2) AIFoundry 图标
icon = Image.open(os.path.join(ROOT, 'public', 'brand-icon.png'))
icon = trim(transparent_from_bg(icon))
icon.save(os.path.join(HERE, 'aifoundry-icon.png'))
print('icon', icon.size)

# 3) FY 工作室 Logo
fy = Image.open(r'C:\Users\QYF\.workbuddy\clipboard-images\clipboard-2026-10-10T11-15-55-810Z-7275026f.jpg')
fy = trim(transparent_from_bg(fy))
fy.save(os.path.join(HERE, 'fy-studio.png'))
print('fy', fy.size)
