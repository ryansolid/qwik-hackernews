import{a as e,j as a}from"./q-b3dc9709.js";import{b as s}from"./q-5b6f6d3d.js";const l=()=>{const[l]=e(),{stories:i,page:r,type:n}=l.data;return a("div",{class:"news-view",children:[a("div",{class:"news-list-nav",children:[r>1?a("a",{class:"page-link",href:`/?type=${n}&page=${r-1}`,"aria-label":"Previous Page",children:["<"," prev"]}):a("span",{class:"page-link disabled","aria-disabled":"true",children:["<"," prev"]}),a("span",{children:["page ",r]}),i&&i.length>=29?a("a",{class:"page-link",href:`/?type=${n}&page=${r+1}`,"aria-label":"Next Page",children:["more ",">"]}):a("span",{class:"page-link disabled","aria-disabled":"true",children:["more ",">"]})]}),a("main",{class:"news-list",children:i&&a("ul",{children:i.map((e=>a(s,{story:e})))})})]})};export{l as Stories_onRender};
