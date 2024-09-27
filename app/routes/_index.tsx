import type { MetaFunction } from "@remix-run/node";

import Product from "~/components/Product";

export const meta: MetaFunction = () => {
  return [
    { title: "Product-List App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  return (
   <div>
 <Product/>
   </div>
   
 );
}


