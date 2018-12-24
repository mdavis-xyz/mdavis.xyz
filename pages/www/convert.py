from mako.template import Template
import datetime as dt
import yaml
import pprint as pp

template_fname = "template.html"
content_md_fname = "content.md"
output_fname = "docs/index.html"

with open(template_fname,"r") as f:
    template = f.read()

dateStr = dt.date.today().strftime('%d, %b %Y')
template = template.replace('{{date}}',dateStr)

inputFname = 'pages.yaml'
with open(inputFname,'r') as f:
    pagesData = yaml.load(f)
pp.pprint(pagesData)
output_html = Template(template).render(pages=pagesData)

with open(output_fname,"w") as f:
    f.write(output_html)
print("Done")
