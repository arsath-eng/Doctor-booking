<script>
  import { link } from 'svelte-spa-router';
  let isMenuOpen = false;

  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }
</script>

<header>
  <div class="container header-content">
    <a href="/" use:link class="logo">Admin Panel</a>
    <nav class="desktop-nav">
      <a href="/" use:link class="nav-link">Dashboard</a>
      <a href="/bookings" use:link class="nav-link">Bookings</a>
    </nav>
    <button class="mobile-nav-toggle" on:click={toggleMenu}>
      <span class="hamburger"></span>
    </button>
  </div>
  {#if isMenuOpen}
    <nav class="mobile-nav">
      <a href="/" use:link class="nav-link" on:click={toggleMenu}>Dashboard</a>
      <a href="/bookings" use:link class="nav-link" on:click={toggleMenu}>Bookings</a>
    </nav>
  {/if}
</header>

<style>
  header {
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    box-shadow: var(--shadow);
    height: var(--header-height);
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
  }
  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 2rem;
  }
  .logo {
    font-family: var(--font-family-primary);
    font-size: 2rem;
    font-weight: 700;
    color: white;
    text-decoration: none;
    transition: color 0.2s;
  }
  .logo:hover {
    color: var(--accent-color);
  }
  .desktop-nav {
    display: flex;
    gap: 2rem;
  }
  .nav-link {
    font-family: var(--font-family-secondary);
    text-decoration: none;
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    transition: background-color 0.2s, color 0.2s;
  }
  .nav-link:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--accent-color);
  }

  .mobile-nav-toggle {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
  }

  .hamburger {
    display: block;
    width: 25px;
    height: 3px;
    background-color: white;
    position: relative;
    transition: background-color 0.3s ease-in-out;
  }

  .hamburger::before,
  .hamburger::after {
    content: '';
    position: absolute;
    width: 25px;
    height: 3px;
    background-color: white;
    transition: transform 0.3s ease-in-out;
  }

  .hamburger::before {
    top: -8px;
  }

  .hamburger::after {
    bottom: -8px;
  }

  .mobile-nav {
    display: none;
  }

  @media (max-width: 768px) {
    .desktop-nav {
      display: none;
    }

    .mobile-nav-toggle {
      display: block;
    }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: var(--header-height);
      left: 0;
      width: 100%;
      background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
      box-shadow: var(--shadow);
      padding: 1rem 0;
    }

    .mobile-nav .nav-link {
      text-align: center;
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .mobile-nav .nav-link:last-child {
      border-bottom: none;
    }
  }
</style>