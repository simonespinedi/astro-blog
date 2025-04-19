document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('menu-toggle');
  const menu = document.getElementById('right-buttons');

  toggleButton.addEventListener('click', () => {
    menu.classList.toggle('show');
  });

  // Chiudi il menu se si clicca su uno dei link
  document.querySelectorAll('#right-buttons a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('show');
    });
  });
});
