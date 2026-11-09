export const initial = () => ({version:1,people:1,days:3,children:false,pets:false,quantities:{},checked:{},plan:{},archive:[],lastDownload:null});
export const items = [
 ['water','Drinking water','Food & water','litres','3 litres per person per day. Allow extra for washing, cooking and pets.'],
 ['food','Ready-to-eat food','Food & water','days','Food your household normally eats that needs no cooking or refrigeration. Include a manual tin opener.'],
 ['torch','Torch and spare batteries','Light & warmth','kits','Check the torch works and the batteries fit. Torches are safer than candles.'],
 ['warmth','Warm clothing and blankets','Light & warmth','people','Check everyone has suitable layers and bedding.'],
 ['bank','Charged power bank','Communication','units','Check it charges your phone and keep the right cable with it.'],
 ['radio','Battery or wind-up FM radio','Communication','units','Test reception and write useful radio frequencies in your plan.'],
 ['firstaid','First aid supplies','Health & hygiene','kits','Check the contents and expiry dates.'],
 ['hygiene','Hygiene essentials','Health & hygiene','days','Include wipes, hand sanitiser and the bathroom products your household uses.'],
 ['child','Child essentials','Family & pets','days','Check age-appropriate food, nappies and wipes as needed.'],
 ['pet','Pet food and supplies','Family & pets','days','Include drinking water and any care supplies your pets need.']
];
export function target(id,s){return id==='water'?s.people*s.days*3:['food','hygiene','child','pet'].includes(id)?s.days:id==='warmth'?s.people:1;}
export function activeItems(s){return items.filter(([id])=>(id!=='child'||s.children)&&(id!=='pet'||s.pets));}
export function coverage(s){return (s.quantities.water||0)/(s.people*3);}
export function validate(v){
 if(!v||v.version!==1||!Number.isInteger(v.people)||v.people<1||v.people>30||!Number.isInteger(v.days)||v.days<1||v.days>14)throw Error('This is not a supported household backup.');
 const out=initial();out.people=v.people;out.days=v.days;out.children=!!v.children;out.pets=!!v.pets;
 for(const [id] of items){const q=v.quantities?.[id]??0;if(!Number.isFinite(q)||q<0||q>100000)throw Error('Invalid supply quantity.');out.quantities[id]=q;}
 for(const id of ['contacts','meeting','radio','support','notes'])out.plan[id]=String(v.plan?.[id]??'').slice(0,5000);
 for(const id of ['contacts','cash','documents','medication','support'])out.checked[id]=!!v.checked?.[id];
 return out;
}
