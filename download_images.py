"""
PMVS: download all images used on the home page into the images/ folder,
then switch index.html from the live-site URLs to the local files.

Run once from this folder (internet needed):
    python download_images.py          (Windows)
    python3 download_images.py         (Mac / Linux)
"""
import os, sys, urllib.request

SITE = "https://www.pmvsllp.com/"
BASE = SITE + "assets/images/"

FILES = (
  ["banner/" + f for f in ["slider-1.jpg","tax.jpg","project-finance.jpg","reclaimed.jpg","subsidy.jpg",
                           "management-consultancy.jpg","accounting-outsourcing.jpg","transaction-advisory.jpg"]]
+ ["about-us-img.jpg"]
+ ["services/" + f for f in ["audit.png","team.png","taxation.png","finance.png","incentive.png",
                             "dividend.png","agreement.png","transaction.png"]]
+ ["industries/" + f for f in ["1.jpeg","metal.png","infrastructure.jpg","compliant.png","textile.jpg",
      "art-and-design.png","packaging.jpg","box.png","pharma.jpg","pharmaceuticals.png","engineering.jpg",
      "it.png","auto-ancillary.jpg","brake.png","oil-chemicals.jpg","oil-barrel.png","machinery.jpg","machinery.png"]]
+ ["prem-maheshwari.jpeg","punit-varma.jpeg","vishvesh-shah.jpeg","sneh-shah.jpg",
   "prakash-labadiya.jpeg","manish-sarda.jpg","dipak-kushwah.jpg"]
+ ["why-choose-us/" + f for f in ["secret-file.png","team.png","quality-control.png","transparency.png",
      "integration.png","certificate.png","solutions.png","approach.png","advice.png"]]
+ ["call.svg","contact-mail.svg","location.png"]
)

# (remote url, local file)
EXTRA = [
  (SITE + "uploads/admin/settings/pmvs1720156796.png", "logo.png"),
  (SITE + "uploads/admin/settings/pmvs-new-favicon1720157177.png", "favicon.png"),
]

jobs = [(BASE + f, f) for f in FILES] + EXTRA
here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, "images")
failed = []

for url, rel in jobs:
    dest = os.path.join(out, rel)
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r, open(dest, "wb") as f:
            f.write(r.read())
        print("ok     ", rel)
    except Exception as e:
        failed.append(rel)
        print("FAILED ", rel, "-", e)

print("\nDownloaded %d of %d files." % (len(jobs) - len(failed), len(jobs)))

if failed:
    print("Some files failed, so index.html was NOT changed. Fix the list above and run again.")
    sys.exit(1)

# Everything downloaded: point index.html to the local copies.
p = os.path.join(here, "index.html")
html = open(p, encoding="utf-8").read()
html = html.replace(SITE + "uploads/admin/settings/pmvs1720156796.png", "images/logo.png")
html = html.replace(SITE + "uploads/admin/settings/pmvs-new-favicon1720157177.png", "images/favicon.png")
html = html.replace(BASE, "images/")
open(p, "w", encoding="utf-8").write(html)
print("index.html now uses the local images/ folder.")
