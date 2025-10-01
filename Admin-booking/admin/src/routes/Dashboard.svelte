<script>
  import { bookingStore } from '../store/bookingStore.js';

  const { bookings, currentNumbers } = bookingStore;

  function getSessionBookings(session) {
    return $bookings?.filter(b => b.session === session) || [];
  }

  function handleNextPatient(session) {
    bookingStore.advanceCurrentNumber(session);
  }
</script>

<div class="dashboard-container">
  <h1 class="title">Admin Dashboard</h1>
  <div class="dashboard-grid">
    {#each ['morning', 'evening', 'night'] as session}
      {@const bookingsInSession = getSessionBookings(session)}
      {@const currentPatientNum = bookingStore.getCurrentNumber(session)}
      <div class="session-card">
        <h2 class="session-title">{session.charAt(0).toUpperCase() + session.slice(1)} Session</h2>
        <div class="stats">
          <div class="stat-item">
            <span class="stat-value">
              {($currentNumbers && $currentNumbers[`${session}-${new Date().toISOString().split('T')[0]}`]) || 0}
            </span>
            <span class="stat-label">Now Serving</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{bookingsInSession.length}</span>
            <span class="stat-label">Total Bookings</span>
          </div>
        </div>
        <button
          class="next-button"
          on:click={() => handleNextPatient(session)}
          disabled={currentPatientNum >= bookingsInSession.length}
        >
          Next Patient
        </button>
      </div>
    {/each}
  </div>
</div>

<style>
  .dashboard-container {
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
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
  }
  .session-card {
    background: linear-gradient(135deg, var(--card-background-color), #ffffff);
    border-radius: var(--radius);
    padding: 2rem;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s;
  }
  .session-card:hover {
    transform: translateY(-5px);
  }
  .session-title {
    font-family: var(--font-family-primary);
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--secondary-color);
    margin-bottom: 1.5rem;
    text-align: center;
  }
  .stats {
    display: flex;
    justify-content: space-around;
    margin-bottom: 2rem;
    text-align: center;
  }
  .stat-item {
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: var(--radius);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  .stat-value {
    font-family: var(--font-family-secondary);
    font-size: 2.8rem;
    font-weight: 700;
    color: var(--primary-color);
    display: block;
  }
  .stat-label {
    font-family: var(--font-family-secondary);
    font-size: 1rem;
    color: #555;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .next-button {
    width: 100%;
    padding: 1rem;
    font-family: var(--font-family-secondary);
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: var(--radius);
    background-color: var(--accent-color);
    color: white;
    cursor: pointer;
    margin-top: auto;
    transition: background-color 0.2s, transform 0.1s;
  }
  .next-button:hover:not(:disabled) {
    background-color: #27ae60;
    transform: scale(1.05);
  }
  .next-button:disabled {
    background-color: #bdc3c7;
    cursor: not-allowed;
  }
</style>