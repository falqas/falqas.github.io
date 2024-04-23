---
date: 2023-10-30
---

Writing basic node scripts in TypeScript can be a fiddly experience. The vast majority of online articles and docs area geared toward using TS as part of a larger project (React, webpack etc) rather than one-off scripting.

Sure you can install `ts-node` globally, but then if you want to do any debugging within VScode (with functioning breakpoints) there's not a lot of guidance.

I put together this [starter](https://github.com/falqas/starter) repo that is as bare-bones as possible, which gets all the config/fiddliness out of the way so I can get started on writing actual code. I've been cloning and using it for most of my scripts, and so far it's worked well for me.
