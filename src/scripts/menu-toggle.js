document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('menu-toggle');
    const menu = document.getElementById('right-buttons');
  
    toggleButton.addEventListener('click', () => {
      menu.classList.toggle('show');
    });
  });