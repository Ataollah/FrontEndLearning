import Image from "next/image";

export default function Home() {
  return (
    <>

    <div class="flex flex-row">
      <div>Item 1</div>
      <div>Item 2</div>
    </div>
    
    <div class="flex flex-row-reverse">
      <div>Item 1</div>
      <div>Item 2</div>
    </div>
    
    <div class="flex flex-col">
      <div>Item 1</div>
      <div>Item 2</div>
    </div>
    
    <div class="flex flex-col-reverse">
      <div>Item 1</div>
      <div>Item 2</div>
    </div>
    </>
  ); 
}
