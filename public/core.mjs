export const initial = () => ({version:1,people:1,days:3,children:false,pets:false,quantities:{},targets:{},checked:{},plan:{},archive:[],lastDownload:null});
// Equipment and food amounts are editable planning examples, not government requirements.
export const items = [
 ['water','Drinking water','Food & water','litres','3 litres per person per day for drinking. Extra water for cooking, washing and pets is separate.'],
 ['protein','Tinned protein','Food & water','tins','Ready-to-eat beans, fish or meat that your household normally eats. Check portions and dietary needs.'],
 ['veg','Tinned vegetables & beans','Food & water','tins','Choose food that can be eaten without heating.'],
 ['fruit','Tinned fruit','Food & water','tins','Fruit in juice, or a suitable shelf-stable alternative.'],
 ['carbs','Ready-to-eat carbohydrates','Food & water','packs','Crackers, oatcakes or ready-to-eat bread products. Dry rice and pasta need water and cooking.'],
 ['snacks','Shelf-stable snacks','Food & water','packs','Choose familiar snacks suitable for everyone’s dietary needs.'],
 ['bank','Charged power banks','Power & light','units','Include compatible charging cables. Capacity and required charging time vary by device.'],
 ['batteries','Spare batteries','Power & light','batteries','Check the sizes needed by your torch and radio before buying.'],
 ['torch','Torches / lanterns','Power & light','units','Test them and keep them somewhere easy to find. Torches are safer than candles.'],
 ['radio','Battery / wind-up FM radio','Communication & tools','units','Test reception and write down useful radio frequencies.'],
 ['opener','Manual tin opener','Communication & tools','units','Check it works with the tins you store.'],
 ['firstaid','First aid kit','Health & hygiene','kits','Check the contents and expiry dates.'],
 ['hygiene','Wet wipes & sanitiser','Health & hygiene','packs','Keep household hygiene supplies accessible.'],
 ['toilet','Toilet roll & waste bags','Health & hygiene','packs','Plan for your household’s normal use.'],
 ['warmth','Blankets / sleeping bags','Warmth & shelter','units','Suitable warm bedding and clothing for each person.'],
 ['child','Nappies, wipes & care supplies','Family & pets','days','Estimate days of supplies for the children who need them.'],
 ['pet','Pet food, litter & care supplies','Family & pets','days','Include pet drinking water separately.'],
 ['food','Whole-household food coverage','Coverage estimates','days','Your own estimate across all recorded food. Tin counts do not automatically establish nutritional coverage.']
];
export function defaultTarget(id,s){const pd=s.people*s.days;return id==='water'?pd*3:['food','child','pet'].includes(id)?s.days:['protein','veg'].includes(id)?pd:id==='fruit'?Math.ceil(pd/3):id==='carbs'?s.people:id==='snacks'?s.people*2:['bank','torch','warmth'].includes(id)?s.people:id==='batteries'?8*s.people:['hygiene','toilet'].includes(id)?Math.max(1,s.people):1;}
export function target(id,s){return s.targets?.[id]??defaultTarget(id,s);}
export function deficit(id,s){return Math.max(0,target(id,s)-(s.quantities[id]||0));}
export function activeItems(s){return items.filter(([id])=>(id!=='child'||s.children)&&(id!=='pet'||s.pets));}
export function coverage(s){return (s.quantities.water||0)/(s.people*3);}
export function validate(v){
 if(!v||v.version!==1||!Number.isInteger(v.people)||v.people<1||v.people>30||!Number.isInteger(v.days)||v.days<1||v.days>14)throw Error('This is not a supported household backup.');
 const out=initial();out.people=v.people;out.days=v.days;out.children=!!v.children;out.pets=!!v.pets;
 for(const [id] of items){const q=v.quantities?.[id]??0;if(!Number.isFinite(q)||q<0||q>100000)throw Error('Invalid supply quantity.');out.quantities[id]=q;const t=v.targets?.[id];if(t!==undefined){if(!Number.isFinite(t)||t<0||t>100000)throw Error('Invalid supply target.');out.targets[id]=t;}}
 for(const id of ['contacts','meeting','radio','support','notes'])out.plan[id]=String(v.plan?.[id]??'').slice(0,5000);
 for(const id of ['contacts','cash','documents','medication','support'])out.checked[id]=!!v.checked?.[id];
 return out;
}
