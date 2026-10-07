"""Two new LAM guides (VI + EN): Lightroom recipes -> LAM looks, and shutter speed on a phone.
Facts are from the shipped app (1.0.2 catalogue, kept in 1.0.3) and from a Pixel 6 Pro camera dump."""
import os, re

G = os.path.expanduser('~/DATA/PRIVATE/brewkits.github.io/static/lam/guides')
tpl = open(os.path.join(G, 'pro-mode-peaking-zebra-log.html')).read()
head_tpl = tpl[:tpl.index('<body>')]
EXTRA_CSS = '''<style>
  table{width:100%;border-collapse:collapse;margin:20px 0 8px;font-size:15px}
  th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
  th{font-family:var(--ms);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:500}
  td b{color:#fff}
  .tag{display:inline-block;font-family:var(--ms);font-size:11px;padding:1px 6px;border-radius:4px;border:1px solid var(--line);color:var(--muted);margin-left:4px}
  .tag.free{color:#a9e8b8;border-color:rgba(150,230,170,.4)}
  .warn{border-color:rgba(255,193,7,.45)}
  @media (max-width:640px){table{font-size:14px}th,td{padding:8px 6px}}
</style>
'''

def head(lang, title, desc, vi_slug, en_slug):
    h = head_tpl
    h = re.sub(r'<html lang="[a-z]+">', f'<html lang="{lang}">', h)
    h = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', h, flags=re.S)
    h = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', h)
    h = re.sub(r'hreflang="vi" href="[^"]+"', f'hreflang="vi" href="https://brewkits.dev/lam/guides/{vi_slug}"', h)
    h = re.sub(r'hreflang="en" href="[^"]+"', f'hreflang="en" href="https://brewkits.dev/lam/guides/en/{en_slug}"', h)
    h = re.sub(r'hreflang="x-default" href="[^"]+"', f'hreflang="x-default" href="https://brewkits.dev/lam/guides/en/{en_slug}"', h)
    if lang == 'en':  # EN pages live one folder deeper
        h = h.replace('url(../fonts/', 'url(../../fonts/')
    return h.replace('</head>', EXTRA_CSS + '</head>')

def page(lang, title, desc, vi_slug, en_slug, kicker, minutes, body):
    home = '/lam/guides/' if lang == 'vi' else '/lam/guides/en/'
    guides = 'Hướng dẫn LAM' if lang == 'vi' else 'LAM Guides'
    read = f'~{minutes} phút đọc' if lang == 'vi' else f'~{minutes} min read'
    back = '← Tất cả hướng dẫn' if lang == 'vi' else '← All guides'
    about = 'Về LAM' if lang == 'vi' else 'About LAM'
    other = (f'<a href="/lam/guides/en/{en_slug}">English</a>' if lang == 'vi' else f'<a href="/lam/guides/{vi_slug}">Tiếng Việt</a>')
    return (head(lang, title, desc, vi_slug, en_slug) + '<body>\n<div class="wrap">\n'
            f'  <p class="kicker"><a href="{home}">{guides}</a> · {kicker}</p>\n'
            f'  <h1>{title.split(" — ")[0]}</h1>\n  <p class="meta">{read}</p>\n' + body +
            f'\n  <hr>\n  <footer>\n    <a href="{home}">{back}</a> · <a href="/lam/">{about}</a> · {other}\n  </footer>\n</div>\n</body>\n</html>\n')

FREE = '<span class="tag free">{}</span>'

# ───────────────────────────── 1. Lightroom recipes → LAM ─────────────────────────────
VI1 = '''
  <p class="lead">Trên mạng có hàng trăm "công thức chỉnh ảnh": Exposure +50, Highlights −80, Shadows +40,
  Temp −10… Chép đúng từng con số vẫn ít khi ra ảnh giống. Bài này giải thích vì sao, các công thức đó
  thực ra đang làm gì, và nên chọn look nào trong LAM để có cùng tinh thần ngay lúc bấm máy.</p>

  <h2>Vì sao chép số không ra cùng một ảnh</h2>
  <p>Mỗi con số trong công thức là <strong>tương đối</strong>: nó cộng thêm vào một điểm xuất phát. Với
  Lightroom, điểm xuất phát là ảnh gốc của máy người viết công thức. Với các app filter (mã kiểu PL1, MT2,
  YU4…), điểm xuất phát còn là chính bộ lọc độc quyền của app đó. Đổi máy, đổi ánh sáng, đổi app là đổi
  điểm xuất phát, và cùng một "Highlights −80" sẽ cho kết quả khác.</p>
  <p>Thêm một vấn đề: ảnh điện thoại mặc định đã được máy xử lý sẵn (HDR, làm nét, khử nhiễu). Chỉnh tiếp
  lên ảnh đó là chỉnh lần hai trên dữ liệu đã bị nén — xem
  <a href="/lam/guides/sai-lech-2-lan-filter-hau-ky.html">Cái bẫy "sai lệch hai lần"</a>.</p>

  <h2>Các công thức phổ biến thực ra đang làm gì</h2>
  <p>Đọc kỹ các công thức Lightroom đang được chia sẻ nhiều ở Việt Nam, chúng gần như đều lặp lại một
  khuôn:</p>
  <table>
    <tr><th>Thanh trượt</th><th>Giá trị hay gặp</th><th>Trong ngôn ngữ phim</th></tr>
    <tr><td><b>Contrast</b></td><td>−25 đến −50</td><td>Phim âm bản tương phản thấp, dải sáng rộng</td></tr>
    <tr><td><b>Highlights</b></td><td>−46 đến −100</td><td>"Vai" của đường cong phim: vùng sáng uốn mềm thay vì cháy cứng</td></tr>
    <tr><td><b>Shadows</b></td><td>+26 đến +84</td><td>Vùng tối được nâng — "đáy" phim không đen kịt</td></tr>
    <tr><td><b>Temperature</b></td><td>−5 đến −30 (hoặc +6 đến +21)</td><td>Cân bằng màu riêng của từng loại phim: lạnh trong trẻo hoặc ấm vàng</td></tr>
    <tr><td><b>Vibrance / Saturation</b></td><td>+10 đến +30 / −20 đến −36</td><td>Phim "dịu màu" hoặc phim dương bản rực</td></tr>
    <tr><td><b>Grain</b></td><td>+20</td><td>Hạt bạc của phim</td></tr>
  </table>
  <p>Nói cách khác: phần lớn công thức đang cố <strong>bắt chước một cuộn phim</strong> — vai sáng mềm,
  đáy tối nâng, một tông màu riêng và chút hạt. LAM làm điều đó từ đầu, trên dữ liệu cảm biến lúc chụp,
  thay vì kéo thanh trượt sau khi ảnh đã thành JPEG.</p>

  <div class="card warn">
    <p><strong>Đừng chép những giá trị cực đoan.</strong> Highlights −100 cùng Shadows −100, hay Contrast
    −100, ép mọi vùng sáng-tối về giữa: ảnh xám, bệt, da mất khối. Một cuộn phim thật không bao giờ trông
    như vậy — dải tương phản thấp vẫn còn điểm đen và điểm trắng.</p>
  </div>

  <h2>Công thức quen thuộc → look trong LAM</h2>
  <p>Bảng dưới ghép các phong cách hay gặp với công thức (recipe) và phim có sẵn trong LAM. Đây là cùng
  <em>tinh thần</em> — không phải bản sao từng con số, vì LAM không làm việc bằng thanh trượt trên JPEG.</p>
  <table>
    <tr><th>Phong cách</th><th>Look trong LAM</th><th>Phim</th></tr>
    <tr><td>Ngược sáng trong trẻo, tông mát</td><td><b>Hanoi Dream</b>''' + FREE.format('Miễn phí') + ''' · Chiang Mai Mist</td><td>Pastel 400</td></tr>
    <tr><td>Vàng ấm ngọt, nắng sớm</td><td><b>Gold Sea Morning</b> · Golden SEA</td><td>Gold 200 · Portia 800</td></tr>
    <tr><td>Hàn Quốc trong, da hồng nhẹ</td><td><b>Seoul Soft</b> · Busan Bright</td><td>Portia 160</td></tr>
    <tr><td>Vintage ấm, kỷ niệm</td><td><b>Gold Summer</b> · Bukchon Vintage</td><td>Gold 200 · Gold 400</td></tr>
    <tr><td>Nhạt màu kiểu Pinterest</td><td><b>Aesthetic Muted</b></td><td>Pastel 400</td></tr>
    <tr><td>Phố lạnh, điện ảnh</td><td><b>Eternal Street</b> · Jakarta Street</td><td>Eternal 160 · Cinema 800T</td></tr>
    <tr><td>Phố đêm, đèn neon</td><td><b>Saigon Noir</b>''' + FREE.format('Miễn phí') + ''' · Tungsten Night</td><td>CCD 2000 · Cinema 800T</td></tr>
    <tr><td>Trời xanh, du lịch rực rỡ</td><td><b>Velvet Vivid</b> · Cali Sun</td><td>Velvet 50 · Ultra 50</td></tr>
    <tr><td>Vlog tự nhiên, ít "filter"</td><td><b>Vlog Bright</b>''' + FREE.format('Miễn phí') + '''</td><td>Gold 400</td></tr>
    <tr><td>Đen trắng phóng sự</td><td><b>Tokyo Mood</b></td><td>Silver 400</td></tr>
  </table>

  <h2>Tinh chỉnh trong LAM thay cho thanh trượt</h2>
  <ul>
    <li><strong>Độ mạnh của phim</strong> — kéo xuống khi muốn nhẹ tay hơn, giống giảm "Amount" của preset.</li>
    <li><strong>Hạt</strong> — thay cho thanh Grain; hạt của LAM nằm ở vùng trung tính như phim thật, không rải đều cả ảnh.</li>
    <li><strong>Cân bằng trắng theo Kelvin</strong> (chế độ Pro, 2700–7500 K) — thay cho Temperature, nhưng tác động lúc chụp.</li>
    <li><strong>Bù sáng EV</strong> (±3) — thay cho Exposure. Hơi dư sáng một chút hợp với các look ngược sáng.</li>
    <li><strong>True Skin</strong> — thay cho việc chỉnh HSL cam/đỏ để cứu màu da: chọn tông da (Warm SEA, Golden Hour, Neutral, Cool) và LAM chỉnh ngay lúc chụp.</li>
  </ul>
  <p>Khi đã ưng một look, LAM cho bạn chia sẻ nó bằng một <a href="/lam/guides/recipe-code-chia-se-look.html">mã
  công thức 8 ký tự</a> — người khác dán vào là có đúng look đó, không phải chép từng con số.</p>
'''

EN1 = '''
  <p class="lead">The internet is full of "editing recipes": Exposure +50, Highlights −80, Shadows +40,
  Temp −10… Copying every number rarely gives you the same photo. This guide explains why, what those
  recipes are really doing, and which LAM look gets you the same spirit at the moment you press the
  shutter.</p>

  <h2>Why copying numbers doesn't copy the photo</h2>
  <p>Every number in a recipe is <strong>relative</strong>: it is added to a starting point. In
  Lightroom, the starting point is the original file from the author's camera. In filter apps (codes like
  PL1, MT2, YU4…), the starting point also includes that app's own proprietary filter. Change the phone,
  the light or the app, and you change the starting point — the same "Highlights −80" lands somewhere
  else.</p>
  <p>There is a second problem: a phone's default photo is already processed (HDR, sharpening, noise
  reduction). Editing on top of it is a second pass on data that has already been squeezed — see
  <a href="/lam/guides/en/the-double-processing-trap.html">The double-processing trap</a>.</p>

  <h2>What the popular recipes actually do</h2>
  <p>Read the most-shared Lightroom recipes side by side and they nearly all repeat one pattern:</p>
  <table>
    <tr><th>Slider</th><th>Typical value</th><th>In film terms</th></tr>
    <tr><td><b>Contrast</b></td><td>−25 to −50</td><td>A low-contrast negative film with wide latitude</td></tr>
    <tr><td><b>Highlights</b></td><td>−46 to −100</td><td>The film curve's "shoulder": highlights roll off softly instead of clipping</td></tr>
    <tr><td><b>Shadows</b></td><td>+26 to +84</td><td>Lifted shadows — the film's base never goes to pure black</td></tr>
    <tr><td><b>Temperature</b></td><td>−5 to −30 (or +6 to +21)</td><td>Each film's own colour balance: cool and clear, or warm and golden</td></tr>
    <tr><td><b>Vibrance / Saturation</b></td><td>+10 to +30 / −20 to −36</td><td>A muted film, or a vivid slide film</td></tr>
    <tr><td><b>Grain</b></td><td>+20</td><td>The film's silver grain</td></tr>
  </table>
  <p>In other words, most recipes are trying to <strong>imitate a roll of film</strong> — a soft
  highlight shoulder, lifted blacks, a colour signature and a little grain. LAM does that from the start,
  on the sensor data at capture, instead of pushing sliders after the photo is already a JPEG.</p>

  <div class="card warn">
    <p><strong>Skip the extreme values.</strong> Highlights −100 with Shadows −100, or Contrast −100, pushes
    every tone towards the middle: grey, flat, skin without shape. Real film never looks like that — even a
    low-contrast stock keeps a black point and a white point.</p>
  </div>

  <h2>Familiar recipe → LAM look</h2>
  <p>The table pairs common styles with recipes and films already in LAM. It is the same <em>spirit</em>,
  not a number-for-number copy, because LAM doesn't work by pushing sliders on a JPEG.</p>
  <table>
    <tr><th>Style</th><th>LAM look</th><th>Film</th></tr>
    <tr><td>Bright backlit, cool and airy</td><td><b>Hanoi Dream</b>''' + FREE.format('Free') + ''' · Chiang Mai Mist</td><td>Pastel 400</td></tr>
    <tr><td>Sweet warm, morning sun</td><td><b>Gold Sea Morning</b> · Golden SEA</td><td>Gold 200 · Portia 800</td></tr>
    <tr><td>Korean clean, soft rosy skin</td><td><b>Seoul Soft</b> · Busan Bright</td><td>Portia 160</td></tr>
    <tr><td>Warm vintage, nostalgic</td><td><b>Gold Summer</b> · Bukchon Vintage</td><td>Gold 200 · Gold 400</td></tr>
    <tr><td>Muted, Pinterest-style</td><td><b>Aesthetic Muted</b></td><td>Pastel 400</td></tr>
    <tr><td>Cool cinematic street</td><td><b>Eternal Street</b> · Jakarta Street</td><td>Eternal 160 · Cinema 800T</td></tr>
    <tr><td>Night street, neon</td><td><b>Saigon Noir</b>''' + FREE.format('Free') + ''' · Tungsten Night</td><td>CCD 2000 · Cinema 800T</td></tr>
    <tr><td>Blue skies, vivid travel</td><td><b>Velvet Vivid</b> · Cali Sun</td><td>Velvet 50 · Ultra 50</td></tr>
    <tr><td>Natural vlog, barely "filtered"</td><td><b>Vlog Bright</b>''' + FREE.format('Free') + '''</td><td>Gold 400</td></tr>
    <tr><td>Documentary black &amp; white</td><td><b>Tokyo Mood</b></td><td>Silver 400</td></tr>
  </table>

  <h2>Fine-tuning in LAM instead of sliders</h2>
  <ul>
    <li><strong>Film strength</strong> — lower it for a lighter touch, like reducing a preset's "Amount".</li>
    <li><strong>Grain</strong> — instead of the Grain slider; LAM's grain sits in the mid-tones like real film, not evenly across the frame.</li>
    <li><strong>Kelvin white balance</strong> (Pro mode, 2700–7500 K) — instead of Temperature, but applied at capture.</li>
    <li><strong>EV compensation</strong> (±3) — instead of Exposure. A touch over suits the backlit looks.</li>
    <li><strong>True Skin</strong> — instead of tweaking orange/red HSL to rescue skin: pick a skin mode (Warm SEA, Golden Hour, Neutral, Cool) and LAM corrects at capture.</li>
  </ul>
  <p>Once you like a look, share it as an <a href="/lam/guides/en/recipe-code-sharing-a-look.html">8-character
  recipe code</a> — anyone who pastes it gets exactly that look, no numbers to copy.</p>
'''

# ───────────────────────────── 2. Shutter speed on a phone ─────────────────────────────
VI2 = '''
  <p class="lead">Tốc độ màn trập là thời gian cảm biến nhận ánh sáng cho một tấm ảnh. Nó quyết định hai
  thứ cùng lúc: ảnh sáng hay tối, và chuyển động bị "đóng băng" hay kéo thành vệt. Bài này tóm các mốc
  tốc độ quen thuộc của máy ảnh, rồi nói thật những gì điện thoại làm được và không làm được.</p>

  <h2>Các mốc tốc độ theo chủ thể</h2>
  <table>
    <tr><th>Muốn chụp</th><th>Tốc độ gợi ý</th></tr>
    <tr><td>Cầm tay, cảnh tĩnh, không nhoè</td><td>1/50 – 1/60 s</td></tr>
    <tr><td>Người đi bộ</td><td>1/125 s</td></tr>
    <tr><td>Hạt mưa, giọt nước đứng hình</td><td>1/250 s</td></tr>
    <tr><td>Thể thao, người chạy</td><td>1/500 – 1/1000 s</td></tr>
    <tr><td>Xe đang chạy</td><td>1/800 s</td></tr>
    <tr><td>Chim đang bay</td><td>1/2000 s</td></tr>
    <tr><td>Nước chảy thành vệt</td><td>1/10 – 2 s</td></tr>
    <tr><td>Nước mượt như sương, vệt đèn xe</td><td>2 – 10 s</td></tr>
    <tr><td>Dải Ngân Hà</td><td>20 – 30 s</td></tr>
    <tr><td>Vệt sao quay</td><td>10 phút trở lên</td></tr>
  </table>
  <p>Mỗi lần tăng gấp đôi thời gian (1/250 → 1/125) là gấp đôi lượng sáng — gọi là thêm <strong>1 stop</strong>.
  Muốn giữ độ sáng khi đổi tốc độ, phải bù lại bằng ISO (hoặc khẩu độ, nếu máy có).</p>

  <h2>Quy tắc cầm tay: 1/tiêu cự</h2>
  <p>Một quy tắc cũ của máy phim: tốc độ chậm nhất có thể cầm tay mà không nhoè vì rung tay là
  <strong>1 / tiêu cự (quy đổi 35 mm)</strong>. Camera chính của nhiều điện thoại tương đương khoảng 24–26 mm,
  nên mốc là khoảng 1/25 s; ống tele 5× (~110 mm) cần khoảng 1/100 s. Chống rung quang học (OIS) cho thêm vài
  stop, nên camera chính có OIS thường cầm được chậm hơn mốc này.</p>
  <p>Lưu ý: quy tắc này chỉ nói về <em>rung tay</em>. Chủ thể chuyển động vẫn cần tốc độ trong bảng trên.</p>

  <h2>Điện thoại khác máy ảnh ở đâu</h2>
  <ul>
    <li><strong>Khẩu độ cố định.</strong> Ống kính điện thoại thường không đổi khẩu được (ví dụ f/1.85 trên camera
    chính của Pixel 6 Pro), nên chỉ còn tốc độ và ISO để điều chỉnh độ sáng.</li>
    <li><strong>Phơi sáng dài có giới hạn phần cứng.</strong> Đo trên Pixel 6 Pro, cảm biến cho phép phơi tối đa
    khoảng <strong>8,3 giây</strong> ở camera chính và khoảng 16 giây ở camera góc rộng. Ngân Hà 30 giây hay vệt
    sao 10 phút <strong>không làm được bằng một lần phơi</strong>.</li>
    <li><strong>Chế độ đêm là ghép nhiều khung.</strong> Ảnh đêm và ảnh thiên văn trên điện thoại được tạo bằng
    cách chụp nhiều khung ngắn rồi ghép lại, không phải một lần mở màn trập thật lâu.</li>
  </ul>

  <h2>Trong LAM</h2>
  <ul>
    <li><strong>Tự động</strong> là mặc định: máy tự chọn tốc độ, kể cả rất nhanh khi trời sáng — phù hợp
    thể thao hay xe chạy ngoài nắng.</li>
    <li><strong>Chế độ Pro</strong> cho chọn tay các tốc độ <strong>1/30, 1/48, 1/60, 1/120, 1/240</strong> và ISO
    50–6400. Đây là dải của máy quay điện ảnh, đủ cho cầm tay và cho video; LAM không mở tốc độ phơi dài.</li>
    <li><strong>Video và quy tắc 180°:</strong> tốc độ bằng một nửa thời gian một khung hình cho chuyển động mờ tự
    nhiên như phim — 24 hình/giây → 1/48, 30 → 1/60, 60 → 1/120. LAM có sẵn preset này, và không cho chọn tốc
    độ dài hơn một khung hình (không thể quá 360°).</li>
    <li><strong>Chống rung máy</strong> (Nhanh · Bình thường · Kiên nhẫn): bấm chụp, LAM đợi máy đứng yên rồi mới chụp —
    hữu ích khi chụp tốc độ chậm trong nhà.</li>
  </ul>

  <div class="card">
    <p><strong>Tóm lại:</strong> ban ngày cứ để tự động; trong nhà hoặc khi quay video theo kiểu điện ảnh, dùng
    1/48–1/60 trong chế độ Pro và bật chống rung máy. Với Ngân Hà hay vệt sao, hãy dùng chế độ thiên văn
    của chính điện thoại — đó là giới hạn của phần cứng, không phải thứ một app có thể vượt qua.</p>
  </div>
'''

EN2 = '''
  <p class="lead">Shutter speed is how long the sensor gathers light for one photo. It decides two things at
  once: how bright the photo is, and whether motion freezes or streaks. This guide sums up the classic
  camera shutter speeds, then is honest about what a phone can and can't do.</p>

  <h2>Shutter speeds by subject</h2>
  <table>
    <tr><th>To shoot</th><th>Suggested speed</th></tr>
    <tr><td>Handheld, still scene, no blur</td><td>1/50 – 1/60 s</td></tr>
    <tr><td>People walking</td><td>1/125 s</td></tr>
    <tr><td>Raindrops, water droplets frozen</td><td>1/250 s</td></tr>
    <tr><td>Sports, runners</td><td>1/500 – 1/1000 s</td></tr>
    <tr><td>Moving cars</td><td>1/800 s</td></tr>
    <tr><td>Birds in flight</td><td>1/2000 s</td></tr>
    <tr><td>Flowing water as streaks</td><td>1/10 – 2 s</td></tr>
    <tr><td>Misty water, car light trails</td><td>2 – 10 s</td></tr>
    <tr><td>The Milky Way</td><td>20 – 30 s</td></tr>
    <tr><td>Star trails</td><td>10 minutes or more</td></tr>
  </table>
  <p>Each doubling of time (1/250 → 1/125) doubles the light — one <strong>stop</strong>. To keep the same
  brightness when you change speed, compensate with ISO (or aperture, if the camera has one).</p>

  <h2>The handheld rule: 1/focal length</h2>
  <p>An old film-camera rule: the slowest speed you can hold without camera-shake blur is
  <strong>1 / focal length (35 mm equivalent)</strong>. Many phones' main cameras are about 24–26 mm
  equivalent, so the line sits near 1/25 s; a 5× telephoto (~110 mm) needs about 1/100 s. Optical image
  stabilisation (OIS) buys a few stops, so a stabilised main camera usually holds slower than this.</p>
  <p>Note: the rule only covers <em>your hands</em>. A moving subject still needs the speeds in the table.</p>

  <h2>Where a phone differs from a camera</h2>
  <ul>
    <li><strong>Fixed aperture.</strong> Phone lenses usually can't stop down (the Pixel 6 Pro's main camera is
    f/1.85), so shutter speed and ISO are the only exposure controls left.</li>
    <li><strong>Long exposure has a hardware limit.</strong> Measured on a Pixel 6 Pro, the sensor allows at most
    about <strong>8.3 seconds</strong> on the main camera and about 16 seconds on the ultrawide. A 30-second Milky
    Way or a 10-minute star trail <strong>cannot be done in one exposure</strong>.</li>
    <li><strong>Night modes stack frames.</strong> Phone night and astro shots are made by taking many short frames
    and merging them — not by holding the shutter open for a long time.</li>
  </ul>

  <h2>In LAM</h2>
  <ul>
    <li><strong>Auto</strong> is the default: the phone picks the speed, including very fast ones in bright light —
    fine for sports or traffic in the sun.</li>
    <li><strong>Pro mode</strong> lets you set <strong>1/30, 1/48, 1/60, 1/120, 1/240</strong> by hand, with ISO
    50–6400. That is a cinema camera's range — enough for handheld shooting and video; LAM does not offer long
    exposures.</li>
    <li><strong>Video and the 180° rule:</strong> a shutter of half the frame time gives film-like motion blur —
    24 fps → 1/48, 30 → 1/60, 60 → 1/120. LAM has this as a preset, and won't offer a speed longer than one frame
    (past 360°).</li>
    <li><strong>Anti-shake shutter</strong> (Quick · Normal · Patient): press the shutter and LAM waits until the
    phone is still before it fires — useful for slower speeds indoors.</li>
  </ul>

  <div class="card">
    <p><strong>In short:</strong> in daylight, leave it on Auto; indoors or for cinematic video, use 1/48–1/60 in
    Pro mode with the anti-shake shutter on. For the Milky Way or star trails, use your phone's own astro mode —
    that is a hardware limit, not something any app can get past.</p>
  </div>
'''

PAGES = [
    ('vi', 'cong-thuc-lightroom-sang-lam.html', 'lightroom-recipes-to-lam.html',
     'Công thức chỉnh ảnh Lightroom và look phim trong LAM',
     'Vì sao chép số từ công thức chỉnh ảnh không ra cùng một tấm ảnh, các công thức Lightroom phổ biến thực ra đang làm gì, và look nào trong LAM có cùng tinh thần ngay lúc chụp.',
     'Màu &amp; công thức', 7, VI1),
    ('en', 'cong-thuc-lightroom-sang-lam.html', 'lightroom-recipes-to-lam.html',
     'Lightroom editing recipes and LAM film looks',
     'Why copying numbers from an editing recipe does not copy the photo, what the popular Lightroom recipes are really doing, and which LAM look gives the same spirit at capture.',
     'Colour &amp; recipes', 7, EN1),
    ('vi', 'toc-do-man-trap-tren-dien-thoai.html', 'shutter-speed-on-a-phone.html',
     'Tốc độ màn trập: các mốc cần nhớ và giới hạn của điện thoại',
     'Bảng tốc độ màn trập theo chủ thể, quy tắc cầm tay 1/tiêu cự, quy tắc 180° cho video, và những gì điện thoại làm được và không làm được khi phơi sáng.',
     'Đồ nghề Pro', 6, VI2),
    ('en', 'toc-do-man-trap-tren-dien-thoai.html', 'shutter-speed-on-a-phone.html',
     'Shutter speed: the numbers to know, and a phone’s limits',
     'Shutter speeds by subject, the 1/focal-length handheld rule, the 180° rule for video, and what a phone can and cannot do with exposure time.',
     'Pro tools', 6, EN2),
]

for lang, vi_slug, en_slug, title, desc, kicker, minutes, body in PAGES:
    path = os.path.join(G, vi_slug) if lang == 'vi' else os.path.join(G, 'en', en_slug)
    full_title = title + (' — Hướng dẫn LAM' if lang == 'vi' else ' — LAM Guides')
    html = page(lang, full_title, desc, vi_slug, en_slug, kicker, minutes, body)
    open(path, 'w').write(html)
    print('wrote', path, len(html))

# index entries
def add_item(index_path, href, kicker, title, sub):
    s = open(index_path).read()
    if href in s:
        return
    anchor = '  <div class="list">\n'
    assert s.count(anchor) == 1, index_path
    item = (f'    <a class="item" href="{href}">\n      <p class="item-kicker">{kicker}</p>\n'
            f'      <p class="item-title">{title}</p>\n      <p class="item-sub">{sub}</p>\n    </a>\n')
    open(index_path, 'w').write(s.replace(anchor, anchor + item))

add_item(os.path.join(G, 'index.html'), '/lam/guides/toc-do-man-trap-tren-dien-thoai.html', 'Đồ nghề Pro',
         'Tốc độ màn trập: các mốc cần nhớ và giới hạn của điện thoại',
         'Từ 1/2000 s cho chim bay đến 30 s cho Ngân Hà, quy tắc cầm tay 1/tiêu cự, quy tắc 180° cho video — và vì sao điện thoại không phơi được Ngân Hà trong một lần chụp.')
add_item(os.path.join(G, 'index.html'), '/lam/guides/cong-thuc-lightroom-sang-lam.html', 'Màu &amp; công thức',
         'Công thức chỉnh ảnh Lightroom và look phim trong LAM',
         'Vì sao chép số không ra cùng một tấm ảnh, các công thức "ngược sáng", "vàng ấm", "Hàn Quốc" thực ra đang làm gì, và look LAM nào có cùng tinh thần.')
add_item(os.path.join(G, 'en', 'index.html'), '/lam/guides/en/shutter-speed-on-a-phone.html', 'Pro tools',
         'Shutter speed: the numbers to know, and a phone’s limits',
         'From 1/2000 s for birds to 30 s for the Milky Way, the 1/focal-length handheld rule, the 180° rule for video — and why a phone can’t shoot the Milky Way in one exposure.')
add_item(os.path.join(G, 'en', 'index.html'), '/lam/guides/en/lightroom-recipes-to-lam.html', 'Colour &amp; recipes',
         'Lightroom editing recipes and LAM film looks',
         'Why copying numbers doesn’t copy the photo, what "backlit", "warm" and "Korean" recipes really do, and which LAM look shares their spirit.')

# sitemap
SM = os.path.expanduser('~/DATA/PRIVATE/brewkits.github.io/static/lam-sitemap.xml')
s = open(SM).read()
def entry(loc, vi, en):
    return (f'  <url>\n    <loc>{loc}</loc>\n    <lastmod>2026-10-07</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.7</priority>\n'
            f'    <xhtml:link rel="alternate" hreflang="vi" href="{vi}"/>\n    <xhtml:link rel="alternate" hreflang="en" href="{en}"/>\n'
            f'    <xhtml:link rel="alternate" hreflang="x-default" href="{en}"/>\n  </url>\n')
add = ''
for vi_slug, en_slug in (('cong-thuc-lightroom-sang-lam.html', 'lightroom-recipes-to-lam.html'), ('toc-do-man-trap-tren-dien-thoai.html', 'shutter-speed-on-a-phone.html')):
    vi = 'https://brewkits.dev/lam/guides/' + vi_slug; en = 'https://brewkits.dev/lam/guides/en/' + en_slug
    if vi not in s:
        add += '\n' + entry(vi, vi, en) + entry(en, vi, en)
if add:
    assert s.count('</urlset>') == 1
    s = s.replace('</urlset>', add.lstrip('\n') + '</urlset>')
    open(SM, 'w').write(s)
print('index + sitemap updated')
