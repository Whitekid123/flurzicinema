
import fs from 'node:fs';
import path from 'node:path';
const edits={
'components/home/CinemaHero.tsx':[
['Flurzi Cinema — Beyond watching.','Flurzi Cinema — Movies and TV streaming.'],
['A new way into cinema.<br />Made for the curious.<br />Built for story lovers.','Movies. Series.<br />Entertainment.<br />All in one place.'],
['Find your next story','Find your next watch'],
['CINEMA, FROM A DIFFERENT ANGLE.','MOVIE & TV STREAMING · PLATFORM PREVIEW'],
['A story worth getting lost in…','Search movies and TV series…']],
'components/home/FallingFilms.tsx':[
['AN OPENING SCENE.','FEATURED IN THE COLLECTION.'],
['Let yourself<br/>fall into a story.','Discover movies.<br/>Explore series.'],
['EVERY FRAME IS A WAY IN.','MOVIES & SERIES · CATALOG PREVIEW'],
['Find your next story ↗','Browse the collection ↗']],
'components/home/FeaturedExhibition.tsx':[
['LESS SCROLLING. MORE FEELING.','MOVIES & TV SERIES'],
['next story.','next watch.'],
['Follow a feeling.<br/>See where it takes you.','Browse by genre.<br/>Find a movie or series.'],
['Your next obsession.','Explore movies & series.'],
['STORIES IN THIS PREVIEW','TITLES IN THIS PREVIEW'],
['Different worlds.<br/>One place to find them.','Movies and series.<br/>Find your next favorite.']],
'components/home/VaultExperience.tsx':[
['COLLECT MOMENTS. FOLLOW STORIES.','EXPLORE THE MOVIE & TV COLLECTION.'],
['Every era. Every feeling.','Browse movies and series.'],
['Pick a sleeve. Open a world.','Select a title. See the details.'],
['{item === "Film" ? "Movies" : item}','{item === "Film" ? "Movies" : item === "All stories" ? "All titles" : item}'],
['ON YOUR REEL','SELECTED TITLE'],
['FOLLOW THE YEARS','BROWSE BY YEAR']],
'components/home/FeatureLab.tsx':[
['The same story.\\nEven miles apart.','Movie night.\\nTogether.'],
['A shared screen, wherever life takes you. Explore the idea of a movie night that brings everyone into the room.','A planned way to watch movies with friends, wherever you are. Try the local room demo; shared playback is not available yet.'],
['A little less searching.\\nA lot more feeling.','Find movies that\\nmatch your mood.'],
['Start with your mood. Discover a story that meets you there, with a preview of preference-led discovery.','Find movies that fit your mood and preferences. This preview uses sample matches; personalized recommendations are planned.'],
['There’s more\\nbetween the frames.','Get to know\\nthe movie.'],
['Go a little deeper. Explore the places, themes and creative details behind a fictional film.','Explore extra information about a movie, from its setting to its themes. Try a sample using a fictional film.'],
['Your picture.\\nYour perspective.','Streaming quality.\\nData explained.'],
['Understand the balance between picture quality and data, before you press play.','Compare picture quality and estimated data use. This demo illustrates a planned streaming tool; it does not change playback settings.'],
['02 / GO BEYOND WATCHING','02 / PLANNED STREAMING FEATURES'],
['More than a screen.','Choose how'],
['An experience.','you watch.'],
['Thoughtful ideas for the way you discover,','Preview tools for finding movies,'],
[' connect, and get lost in a story.',' watching together and managing data.'],
['A local demonstration of a planned experience.','Planned feature · Local demo only.'],
['A STORY FOR YOUR MOOD','A TITLE FOR YOUR MOOD'],
['Four ways to go beyond watching.','Four planned tools for movie and TV streaming.']],
'components/home/EditorialScenes.tsx':[
['Stories<br/>that stay<br/>with you.','{movie.format === "Series" ? "Series" : "Movies"}<br/>worth<br/>watching.'],
['New worlds. Different perspectives.<br/>The feeling that follows you home.','{movie.format === "Series" ? "Explore the series in our preview." : "Explore a movie from our preview."}<br/>See the synopsis and title details.'],
['A DIFFERENT<br/>POINT OF VIEW ↗','EXPLORE THE<br/>FEATURED TITLE ↗'],
['MAKE ROOM FOR CINEMA.','EXPLORE FLURZI CINEMA.'],
['Your next<br/>great story.','Your next<br/>movie night.'],
['Discover the films. Follow the feeling.<br/>Go beyond watching.','Browse movies. Discover TV series.<br/>Find your next favorite watch.'],
['Enter Flurzi Cinema','Explore the catalog']],
'components/home/CinemaHome.tsx':[
['Flurzi Cinema is a streaming platform concept shaped around beautiful discovery, shared experiences and the stories that stay with us. This is the first public homepage milestone. Every catalog title is fictional.','Flurzi Cinema is a movie and television streaming platform in development. Explore the catalog and planned viewing features in this public preview. The default catalog is fictional; streaming is not available.'],
['A FEW THINGS TO KNOW','FLURZI CINEMA · FAQ'],
['Before the\n              <br />\n              <span className="muted-serif">opening scene.</span>','Your questions.\n              <br />\n              <span className="muted-serif">Answered.</span>'],
['The concept, the plans,','Memberships, viewing features,'],
['and what comes next.','and what is available in this preview.'],
['✓ Saved · Remove from my stories','✓ Saved · Remove from watchlist'],
['+ Save to my stories','+ Add to watchlist'],
['View full story details','View full title details']],
'components/layout/Footer.tsx':[
['For the love of the story.','Movies. TV series. Flurzi Cinema.'],
['A new perspective on cinema.','A movie and TV streaming platform in development.'],
['<br />A public frontend concept, made for what comes next.','<br />Explore the public preview. Streaming is not available yet.']],
'data/movies.ts':[
['Flurzi Cinema is a premium streaming platform concept built around thoughtful discovery and shared experiences. This public website is a frontend preview. All film titles and artwork shown here form a fictional demo catalog; streaming is not available.','Flurzi Cinema is a movie and television streaming platform in development, designed to help you discover, browse and watch video entertainment. This public preview lets you explore a fictional movie and TV catalog and try planned features. Streaming is not available yet.']],
'app/layout.tsx':[
['Flurzi Cinema — Beyond watching','Flurzi Cinema — Movies & TV Streaming'],
['Discover extraordinary stories. Explore the Flurzi Cinema public concept: a new perspective on cinema, discovery and watching together.','Discover movies and TV series with Flurzi Cinema, a streaming platform in development. Explore the public preview; streaming is not available yet.'],
['A new perspective on cinema. Explore the public frontend preview.','Explore movies, TV series and planned streaming features in the Flurzi Cinema public preview. Streaming is not available yet.']],
'tests/homepage.spec.ts':[
['+ Save to my stories','+ Add to watchlist'],
['✓ Saved · Remove from my stories','✓ Saved · Remove from watchlist'],
['name: "All stories"','name: "All titles"']],
'tests/editorial-home.spec.ts':[['View full story details','View full title details']]
};
const backup='docs/rollback/pre-positioning-copy';
const manifest=[];
for(const [file,replacements] of Object.entries(edits)){
 const original=fs.readFileSync(file,'utf8');
 const target=path.join(backup,file);
 fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,original);
 let content=original;
 for(const [before,after] of replacements){
  if(!content.includes(before))throw new Error('Missing copy in '+file+': '+before);
  content=content.replaceAll(before,after);
 }
 fs.writeFileSync(file,content);
 manifest.push({file,replacements:replacements.length});
}
fs.writeFileSync(path.join(backup,'SNAPSHOT.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify(manifest,null,2));
