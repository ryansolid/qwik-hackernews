import{a as s,j as e,F as r}from"./q-b3dc9709.js";const i=()=>{const[i]=s();return e("div",{class:"user-view",children:i&&i.error?e("h1",{children:"User not found."}):e(r,{children:[e("h1",{children:["User : ",i.id]}),e("ul",{class:"meta",children:[e("li",{children:[e("span",{class:"label",children:"Created:"})," ",i.created]}),e("li",{children:[e("span",{class:"label",children:"Karma:"})," ",i.karma]}),i.about&&e("li",{class:"about",children:i.about})]}),e("p",{class:"links",children:[e("a",{href:`https://news.ycombinator.com/submitted?id=${i.id}`,children:"submissions"})," ","|"," ",e("a",{href:`https://news.ycombinator.com/threads?id=${i.id}`,children:"comments"})]})]})})};export{i as User_onRender};