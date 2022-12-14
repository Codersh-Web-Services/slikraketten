let button = document.getElementById("navButton")

button.addEventListener("click", function (e) {

  e.preventDefault();

  const header = document.getElementsByClassName("mainHeader")[0];
  header.classList.toggle("navigationActive");


});

let resizeTimer;
window.addEventListener("resize", () => {
  document.body.classList.add("resize-animation-stopper");
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove("resize-animation-stopper");
  }, 400);
});

try {
  document.querySelector(".mobile-facets__disclosure").addEventListener("click", (e) => document.querySelector(".mobile-facets__disclosure").classList.toggle("menu-opening")
  )

  document.querySelector(".mobile-facets__inner").addEventListener("click", (e) =>
    document.querySelector(".mobile-facets__disclosure").removeAttribute("open")
  )

} catch (error) {
  // console.log(error)
}
