"use strict";var s=require("./core-91f16231.js");exports.User_onRender=()=>{const[e]=s.useLexicalScope();return s.jsx("div",{class:"user-view",children:e&&e.error?s.jsx("h1",{children:"User not found."}):s.jsx(s.Fragment,{children:[s.jsx("h1",{children:["User : ",e.id]}),s.jsx("ul",{class:"meta",children:[s.jsx("li",{children:[s.jsx("span",{class:"label",children:"Created:"})," ",e.created]}),s.jsx("li",{children:[s.jsx("span",{class:"label",children:"Karma:"})," ",e.karma]}),e.about&&s.jsx("li",{class:"about",children:e.about})]}),s.jsx("p",{class:"links",children:[s.jsx("a",{href:`https://news.ycombinator.com/submitted?id=${e.id}`,children:"submissions"})," ","|"," ",s.jsx("a",{href:`https://news.ycombinator.com/threads?id=${e.id}`,children:"comments"})]})]})})};
