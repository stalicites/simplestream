const joinInput = document.getElementById("join");
const joinButton = document.getElementById("joinButton");

joinInput.addEventListener("keydown", function(event){
  if(event.key == "Enter"){
    location.href = "/room#"+joinInput.value;
  }
})

joinButton.addEventListener("click", function(){
  location.href = "/room#"+joinInput.value;
})