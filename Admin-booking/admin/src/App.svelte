<script>
  import Router from 'svelte-spa-router';
  import AdminHeader from './components/AdminHeader.svelte';
  import Dashboard from './routes/Dashboard.svelte';
  import Bookings from './routes/Bookings.svelte';

  const routes = {
    '/': Dashboard,
    '/bookings': Bookings,
  };
</script>

<div class="admin-layout">
  <AdminHeader />
  <main>
    <div class="container">
      <Router {routes} />
    </div>
  </main>
</div>

<style>
  .admin-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  main {
    flex: 1;
    padding-top: var(--header-height);
  }
</style>