<script>
  import { bookingStore } from '../store/bookingStore.js';

  // Destructure the bookings store
  const { bookings } = bookingStore;

  // Group bookings by date and session
  $: groupedBookings = $bookings.reduce((acc, booking) => {
    const date = new Date(booking.time).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!acc[date]) acc[date] = {};
    if (!acc[date][booking.session]) acc[date][booking.session] = [];
    acc[date][booking.session].push(booking);
    return acc;
  }, {});
</script>

<div class="bookings-container">
  <h1 class="title">All Bookings</h1>
  {#if Object.keys(groupedBookings).length === 0}
    <p class="no-bookings">No bookings have been made yet.</p>
  {:else}
    {#each Object.keys(groupedBookings) as date}
      <div class="date-section">
        <h2 class="date-title">{date}</h2>
        {#each ['morning', 'evening', 'night'] as session}
          {#if groupedBookings[date][session] && groupedBookings[date][session].length > 0}
            <div class="session-card">
              <h3 class="session-header">{session.charAt(0).toUpperCase() + session.slice(1)} Session</h3>
              <table class="bookings-table">
                <thead>
                  <tr>
                    <th>Booking #</th>
                    <th>Time</th>
                    <th>Patient Name</th>
                    <th>Phone Number</th>
                  </tr>
                </thead>
                <tbody>
                  {#each groupedBookings[date][session] as booking}
                    <tr>
                      <td>{booking.bookingNumber}</td>
                      <td>{new Date(booking.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{booking.patientName}</td>
                      <td>{booking.patientPhone}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
        {/each}
      </div>
    {/each}
  {/if}
</div>

<style>
  .bookings-container {
    margin-top: calc(var(--header-height) + 1.5rem);
    padding: 2rem;
    background-color: var(--card-background-color);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
  }
  .title {
    font-family: var(--font-family-primary);
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 2rem;
    text-align: center;
  }
  .no-bookings {
    font-family: var(--font-family-secondary);
    font-size: 1.2rem;
    color: #666;
    text-align: center;
    padding: 1rem;
  }
  .date-section {
    margin-bottom: 2.5rem;
  }
  .date-title {
    font-family: var(--font-family-primary);
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--secondary-color);
    margin-bottom: 1.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--border-color);
  }
  .session-card {
    background-color: var(--card-background-color);
    border-radius: var(--radius);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow);
    transition: transform 0.2s;
  }
  .session-card:hover {
    transform: translateY(-5px);
  }
  .session-header {
    font-family: var(--font-family-primary);
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 1rem;
  }
  .bookings-table {
    width: 100%;
    border-collapse: collapse;
    overflow-x: auto;
  }
  th, td {
    font-family: var(--font-family-secondary);
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  th {
    background-color: var(--background-color);
    font-weight: 600;
    color: var(--text-color);
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  tbody tr:nth-child(even) {
    background-color: #f9fafb;
  }
</style>