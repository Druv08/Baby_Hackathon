import type { CharacterProfile, StoryIntro } from "@/types/future";
import type { StoryScene } from "@/types/story";
import type { PortfolioProject } from "@/types/project";

export const MELODY_STORY_INTRO: StoryIntro = {
  "title": "Melody Path",
  "subtitle": "How Maria became the Lullaby Maker",
  "blurb": "One little red panda. A village that forgot how to dream. And a gentle melody waiting to be discovered. Follow Maria as she learns that sometimes the most beautiful thing you can create is something another heart can feel."
};

export const MELODY_SCENES: StoryScene[] = [
  {
    "id": 1,
    "title": "The Village Without a Song",
    "characterId": 1,
    "image": "/stories/melody/scene-1.png",
    "layout": "text-right",
    "interactionId": "melody-chime",
    "narration": "One peaceful evening, Maria wandered into a beautiful little village beneath the glowing moon.\n\nThe streets were decorated with flowers, the windows shone with golden light, and little lanterns hung from every tree.\n\nBut something felt strange.\n\nThe village was completely quiet.\n\nThere was no laughter, no music and not even a little humming.\n\nMaria noticed a tiny bunny sitting beside a window, staring at the night sky.\n\n\"Why do you look so sad?\" Maria asked.\n\nThe bunny sighed.\n\n\"Every night, I close my eyes, but I never have wonderful dreams anymore.\"\n\nMaria looked around the village.\n\nThe houses were still beautiful, and everything seemed normal.\n\nBut the villagers had forgotten the comforting songs they once shared before bedtime.\n\nMaria sat beside the bunny.\n\n\"Maybe there's something I can do to help.\"\n\nFor the first time, she wondered whether happiness could be brought back through something as simple as a song."
  },
  {
    "id": 2,
    "title": "The Forgotten Little Guitar",
    "characterId": 1,
    "image": "/stories/melody/scene-2.png",
    "layout": "text-left",
    "interactionId": "melody-guitar",
    "narration": "The next morning, Maria explored the village, searching for something that might help.\n\nBehind an old cottage, she discovered a little attic filled with dusty musical instruments.\n\nThere were tiny bells, wooden drums, music boxes and a beautiful little guitar resting beside an open window.\n\nMaria gently touched one of its strings.\n\nPling!\n\nA soft musical note echoed through the room.\n\n\"Oh! You can make sounds!\"\n\nShe tried touching another string.\n\nPling! Plong!\n\nSoon, the room filled with funny little notes.\n\nMaria laughed.\n\nShe had never learned to play an instrument before, but every sound made her curious.\n\nThen she discovered an old book filled with handwritten lullabies.\n\nOn the first page was a little message:\n\n\"A lullaby is more than a song. It's a feeling you share with someone.\"\n\nMaria looked at the guitar.\n\n\"Maybe I can learn to make a song for the village!\""
  },
  {
    "id": 3,
    "title": "The Song That Wasn't Quite Right",
    "characterId": 1,
    "image": "/stories/melody/scene-3.png",
    "layout": "text-right",
    "interactionId": "melody-mood",
    "narration": "Maria spent the afternoon practicing.\n\nShe played fast songs, slow songs and songs filled with cheerful little notes.\n\nSome sounded funny.\n\nOthers sounded completely wrong.\n\nBut Maria didn't give up.\n\nThat evening, she returned to the little bunny and proudly played her newest melody.\n\nThe notes were beautiful.\n\nBut the bunny still looked sad.\n\n\"Didn't you like my song?\" Maria asked.\n\n\"I did,\" the bunny replied. \"But I still miss the stories my family used to tell me before bedtime.\"\n\nMaria became quiet.\n\nShe had spent so much time learning how to play that she had forgotten to ask what the bunny actually needed.\n\nShe sat down beside her new friend and listened.\n\nThe bunny told her about warm hugs, beautiful dreams and the gentle songs once sung throughout the village.\n\nMaria held her guitar close.\n\n\"Maybe the perfect song isn't about playing the most beautiful notes.\"\n\n\"Maybe it's about making someone feel understood.\""
  },
  {
    "id": 4,
    "title": "The Melody That Brought Back Dreams",
    "characterId": 1,
    "image": "/stories/melody/scene-4.png",
    "layout": "text-left",
    "interactionId": "melody-build",
    "narration": "That night, Maria sat beneath a flowering tree and began playing again.\n\nBut this time, she didn't rush.\n\nShe remembered the bunny's stories, the quiet village and all the little things that made people feel safe and loved.\n\nShe played one gentle note.\n\nThen another.\n\nSlowly, the notes became a soft, beautiful lullaby.\n\nThe little bunny closed its eyes and smiled.\n\nA tiny glowing musical note floated into the air.\n\nThen another appeared.\n\nSoon, the melody drifted through the village like a warm breeze.\n\nFamilies opened their windows.\n\nLittle animals began humming along.\n\nOne by one, the villagers remembered their favorite bedtime songs and started singing together.\n\nAs the lullaby filled the night, beautiful dreamlike lights appeared above the rooftops.\n\nThe village was no longer silent.\n\nIt was filled with music, warmth and imagination again.\n\nMaria smiled.\n\n\"I didn't need to make the loudest song. I just needed to make one that came from my heart.\""
  },
  {
    "id": 5,
    "title": "Becoming the Lullaby Maker",
    "characterId": 8,
    "image": "/stories/melody/scene-5.png",
    "layout": "center",
    "interactionId": "melody-reveal",
    "narration": "As the moon rose higher, Maria looked across the village.\n\nThe windows glowed warmly, gentle music filled the streets, and little dream lights floated above the sleeping cottages.\n\nMaria remembered how quiet everything had been when she first arrived.\n\nShe had learned that music wasn't only about instruments, perfect melodies or beautiful performances.\n\nIt was about sharing feelings, comforting others and creating something that could bring people together.\n\nShe realized she loved writing little songs, discovering new sounds and making others feel happy and understood.\n\nMaria imagined a future spent creating magical lullabies, collecting beautiful melodies and helping others rediscover the dreams hidden in their hearts.\n\nAnd that was how Maria discovered another possible future.\n\nMelody Maria — The Lullaby Maker.\n\n\"Sometimes a feeling can do what tools cannot.\"\n\nThe little red panda who once knew nothing about music had become someone who could help the world dream again."
  }
];

export const MELODY_PROFILE: CharacterProfile = {
  "species": "Baby red panda",
  "profession": "Lullaby Maker, Dream Musician and Magical Composer",
  "home": "Village of Forgotten Lullabies",
  "personality": [
    "Gentle",
    "Creative",
    "Caring",
    "Sensitive",
    "Cheerful"
  ],
  "theme": "Empathy, creativity, music and emotional connection",
  "specialTalent": "Creating melodies that help others express their feelings and rediscover dreams.",
  "about": [
    "Hi! I'm Melody Maria!",
    "I love making beautiful little songs, discovering new musical sounds, and helping my friends feel happy and peaceful.",
    "Every melody tells a story, and I believe even the tiniest song can make someone's day a little brighter!"
  ],
  "whatIDo": "I create magical lullabies, explore musical instruments, collect little melodies from my adventures, and make comforting songs for my friends.",
  "strengths": [
    "Empathy",
    "Creativity",
    "Musical Expression",
    "Listening",
    "Patience",
    "Imagination"
  ],
  "journey": "I discovered my passion when I visited a village where everyone had forgotten how to dream. By listening to a little bunny and creating a gentle lullaby, I learned how music can help people feel understood.",
  "motto": "Every heart has a little song waiting to be heard."
};

export const MELODY_PROJECTS: PortfolioProject[] = [
  {
    "id": "lullaby-lab",
    "title": "Lullaby Lab",
    "description": "A magical music studio where visitors can create gentle lullabies using Melody Maria's collection of notes, instruments and beautiful melodies.",
    "image": "/projects/melody/lullaby-lab.png",
    "interactionId": "lullaby-lab",
    "status": "ready",
    "implementation": "live"
  },
  {
    "id": "rhythm-garden",
    "title": "Rhythm Garden",
    "description": "A magical garden where glowing flowers create musical notes and visitors can repeat little melodies to make the garden bloom.",
    "interactionId": "rhythm-garden",
    "status": "draft",
    "implementation": "live"
  },
  {
    "id": "moonlight-music-box",
    "title": "Moonlight Music Box",
    "description": "Design a magical music box with glowing stars, gentle melodies and a tiny dream world hidden inside.",
    "interactionId": "moonlight-music-box",
    "status": "draft",
    "implementation": "live"
  }
];
