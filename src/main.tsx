import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Add Material Design ripple effect to buttons
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    
    // Apply ripple to buttons with appropriate classes
    if (
      target.classList.contains('swap-button') || 
      target.classList.contains('icon-button') ||
      target.classList.contains('translate-button') ||
      target.classList.contains('clear-button')
    ) {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      
      // Get button dimensions
      const button = target.closest('button');
      if (!button) return;
      
      // Add material-ripple class if not present
      if (!button.classList.contains('material-ripple')) {
        button.classList.add('material-ripple');
      }
      
      // Calculate ripple size
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      
      // Position the ripple
      const rect = button.getBoundingClientRect();
      const left = event.clientX - rect.left - radius;
      const top = event.clientY - rect.top - radius;
      
      // Set ripple style
      ripple.style.width = `${diameter}px`;
      ripple.style.height = `${diameter}px`;
      ripple.style.left = `${left}px`;
      ripple.style.top = `${top}px`;
      
      // Add ripple to button
      button.appendChild(ripple);
      
      // Remove ripple after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    }
  });
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
