from mako.template import Template
import pypandoc
import datetime as dt

template_fname = "template.html"
content_md_fname = "content.md"
output_fname = "docs/index.html"

with open(template_fname,"r") as f:
    template = f.read()

dateStr = dt.date.today().strftime('%d, %b %Y')
template = template.replace('{{date}}',dateStr)

content = pypandoc.convert_file(content_md_fname, 'html')

print("Content as html:")
print(content)

content = content.replace('<a href=','<a target="_blank" href=').replace('\n','\n'+' '*6)

output_html = Template(template).render(content=content)

with open(output_fname,"w") as f:
    f.write(output_html)
print("Done")
