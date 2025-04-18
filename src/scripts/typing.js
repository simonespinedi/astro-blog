const commands = [
    "show version",
    "show running-config",
    "show ip route"
  ];
  
  let commandIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 150;
  const deletingSpeed = 150;
  const pauseTime = 800;
  
  const typedTextEl = document.getElementById("typed-text");
  
  function typeEffect() {
    const currentCommand = commands[commandIndex];
    
    if (isDeleting) {
      typedTextEl.textContent = currentCommand.substring(0, charIndex--);
      if (charIndex < 0) {
        isDeleting = false;
        commandIndex = (commandIndex + 1) % commands.length;
        setTimeout(typeEffect, typingSpeed);
      } else {
        setTimeout(typeEffect, deletingSpeed);
      }
    } else {
      typedTextEl.textContent = currentCommand.substring(0, charIndex++);
      if (charIndex > currentCommand.length) {
        isDeleting = true;
        setTimeout(typeEffect, pauseTime);
      } else {
        setTimeout(typeEffect, typingSpeed);
      }
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    typeEffect();
  });