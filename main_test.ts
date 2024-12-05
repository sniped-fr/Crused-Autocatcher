import { assertEquals } from "@std/assert";

function add(...x: number[]) {
  let sum = 0;
  for(let i = 0; i < x.length; i ++) sum += x[i];
  console.log(sum)
  return sum;  
}

Deno.test(function addTest() {
  assertEquals(add(2, 3), 5);
});
