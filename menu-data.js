/*
  Sebez Cafe menu draft.
  Prices are transcribed from the readable parts of the uploaded menu photos.
  Names displayed as “Item 01”, “Juice 01”, etc. need confirmation because
  the handwritten/printed Amharic names are not sharp enough to transcribe
  reliably. Edit `name` and `description` here before publishing.
*/
window.SEBeZ_MENU = [
  // English item names and descriptions that were readable in the photos.
  {id:'wrap-chicken',category:'Wraps',name:'Chicken Wrap',nameAm:'የዶሮ ወራፕ',price:380,description:'Chicken, cheese, mayonnaise and French fries.',featured:true},
  {id:'wrap-beef',category:'Wraps',name:'Beef Wrap',price:300,description:'Beef, cheese and French fries.'},
  {id:'wrap-vegetable',category:'Wraps',name:'Vegetable Wrap',price:280,description:'Vegetables and French fries.'},

  // Juice list: the section and prices are clear; individual names need checking.
  ...[250,250,250,200,200,200,200,250,150,150,250].map((price,i)=>({id:`juice-${i+1}`,category:'Fresh Juice',name:`Juice ${String(i+1).padStart(2,'0')}`,nameAm:`ጭማቂ ${i+1}`,price,description:'Fresh juice option — confirm the exact menu name.',verify:true})),

  // The printed menu also shows a Mojito section. It is intentionally not
  // orderable on this teen-safe first version until the cafe confirms it is
  // a non-alcoholic refresher.

  // Hot drinks / coffee-house items: numbered placeholders preserve the visible price sequence.
  ...[35,45,100,60,60,60,50,50,70,50,75,65,45,120,60,100,90,90,45,50,120,60,90,70,80].map((price,i)=>({id:`hot-${i+1}`,category:'Hot Drinks',name:`Hot drink ${String(i+1).padStart(2,'0')}`,nameAm:`ትኩስ መጠጥ ${i+1}`,price,description:'Please confirm the exact Amharic menu name.',verify:true})),

  // Local-food / breakfast list: visible price sequence from the supplied photo.
  ...[150,200,200,250,200,200,220,250,290,220,290,290,280,320,175,225,180,230,330,350,380,400,370,450,380,350,450,300].map((price,i)=>({id:`local-${i+1}`,category:'Local Favourites',name:`Local favourite ${String(i+1).padStart(2,'0')}`,nameAm:`የቤት ምግብ ${i+1}`,price,description:'Name to be confirmed from the original menu photo.',verify:true})),

  // Additional ten menu lines visible on the left-hand menu panel.
  ...[290,200,170,220,270,180,180,200,180,350].map((price,i)=>({id:`special-${i+1}`,category:'Cafe Specials',name:`Cafe special ${String(i+1).padStart(2,'0')}`,nameAm:`ልዩ ምግብ ${i+1}`,price,description:'Name to be confirmed from the original menu photo.',verify:true})),

  // Five additional listed dishes shown in the lower part of the same panel.
  ...[380,380,300,250,290].map((price,i)=>({id:`extra-meal-${i+1}`,category:'More Meals',name:`More meal ${String(i+1).padStart(2,'0')}`,nameAm:`ተጨማሪ ምግብ ${i+1}`,price,description:'Name to be confirmed from the original menu photo.',verify:true}))
];
