"""Save versioned, allowlisted official guidance. Failed checks never replace saved text."""
import json, hashlib, urllib.request, pathlib, datetime
from html.parser import HTMLParser
SOURCES = [
 ('power-cuts', 'Power cuts: official guidance', 'https://beready.campaign.gov.uk/be-informed-about-hazards/power-cuts/'),
 ('household-checklist', 'Preparing your household', 'https://beready.campaign.gov.uk/be-ready-for-emergencies/'),
 ('campaign-announcement', 'Household preparedness campaign', 'https://www.gov.uk/government/news/households-encouraged-to-take-small-simple-steps-to-stay-prepared-in-an-emergency'),
]
class MainText(HTMLParser):
 def __init__(self): super().__init__(); self.depth=0; self.skip=0; self.parts=[]
 def handle_starttag(self,tag,attrs):
  if tag=='main': self.depth+=1
  if self.depth and tag in ('script','style','nav'): self.skip+=1
  if self.depth and tag in ('p','h1','h2','h3','li','br','tr'): self.parts.append('\n')
 def handle_endtag(self,tag):
  if self.depth and tag in ('script','style','nav') and self.skip: self.skip-=1
  if tag=='main' and self.depth:self.depth-=1
 def handle_data(self,data):
  if self.depth and not self.skip:self.parts.append(data)
 def text(self):return '\n'.join(' '.join(line.split()) for line in ''.join(self.parts).splitlines() if line.strip())
def run():
 path=pathlib.Path(__file__).resolve().parents[1]/'public/data/updates.json'
 archive=json.loads(path.read_text()) if path.exists() else {'schemaVersion':1,'sources':[]}
 now=datetime.datetime.now(datetime.timezone.utc).isoformat()
 records={r['id']:r for r in archive['sources']}; failures=0
 for sid,title,url in SOURCES:
  record=records.get(sid,{'id':sid,'title':title,'url':url,'versions':[]})
  record['lastAttemptAt']=now
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'HouseholdReady/0.1 (official guidance archive)'})
   with urllib.request.urlopen(req,timeout=30) as response:
    if urllib.parse.urlparse(response.url).hostname!=urllib.parse.urlparse(url).hostname:raise ValueError('Unexpected redirect host')
    html=response.read(2_000_000).decode('utf-8')
   parser=MainText();parser.feed(html);body=parser.text()
   if len(body)<200:raise ValueError('No usable main article text')
   published=None;updated=None
   if url.startswith('https://www.gov.uk/'):
    with urllib.request.urlopen(url.replace('https://www.gov.uk/','https://www.gov.uk/api/content/'),timeout=30) as response:meta=json.load(response)
    published=meta.get('first_published_at');updated=meta.get('public_updated_at')
   digest=hashlib.sha256(body.encode()).hexdigest()
   if not record['versions'] or record['versions'][0]['hash']!=digest:
    record['versions'].insert(0,{'hash':digest,'savedAt':now,'publishedAt':published,'sourceUpdatedAt':updated,'text':body})
   record.update(lastSuccessfulCheckAt=now,error=None)
  except Exception as exc:
   record['error']='Source check failed; keeping previously saved versions.';failures+=1;print(sid, str(exc))
  records[sid]=record
 archive.update(generatedAt=now,sources=list(records.values()))
 path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(archive,ensure_ascii=False,indent=2)+'\n')
 print(f'Checked {len(SOURCES)} sources; {failures} failures. Previous versions retained.')
 if failures==len(SOURCES):raise SystemExit(1)
if __name__=='__main__':run()
