export default {
  template: `
    <div>
      <h1>Ad Requests Management</h1>
      <div class="row mb-3">
        <div class="col-md-6">
          <label for="campaign-filter" class="form-label">Campaign Name:</label>
          <input type="text" id="campaign-filter" v-model="filters.campaign_name" @input="filterAdRequests" class="form-control" placeholder="Search by campaign name">
        </div>
        <div class="col-md-6">
          <label for="status-filter" class="form-label">Status:</label>
          <select id="status-filter" v-model="filters.status" @change="filterAdRequests" class="form-select">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="under negotiation">Under Negotiation</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div v-for="adRequest in filteredAdRequests" :key="adRequest.id" class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Campaign: {{ adRequest.campaign_name }} (ID: {{ adRequest.campaign_id }})</h5>
              <p class="card-text"><strong>Status:</strong> {{ adRequest.status }}</p>
              <p class="card-text"><strong>Payment Amount:</strong> {{ adRequest.payment_amount }}</p>
              <p class="card-text"><strong>Sponsor Amount:</strong> {{ adRequest.sponsor_amount }}</p>
              <p class="card-text"><strong>Requirements:</strong> {{ adRequest.requirements || 'N/A' }}</p>
              <p class="card-text"><strong>Sponsor Message:</strong> {{ adRequest.sponsor_message || 'N/A' }}</p>
              <p class="card-text"><strong>Influencer Message:</strong> {{ adRequest.influencer_message || 'N/A' }}</p>
              <div class="d-flex justify-content-between">
                <router-link :to="'/adrequest/' + adRequest.id" class="btn btn-info btn-sm">View</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      adRequests: [],
      filters: {
        campaign_name: '',
        status: ''
      },
    };
  },
  computed: {
    filteredAdRequests() {
      return this.adRequests.filter(adRequest => {
        return (
          (this.filters.campaign_name === '' || adRequest.campaign_name.toLowerCase().includes(this.filters.campaign_name.toLowerCase())) &&
          (this.filters.status === '' || adRequest.status === this.filters.status)
        );
      });
    },
  },
  methods: {
    async fetchAdRequests() {
      const res = await fetch('/api/influencer/adrequests', {
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': localStorage.getItem('token'),
        },
      });
      const data = await res.json();
      this.adRequests = data;
    },
    filterAdRequests() {
      this.fetchAdRequests();
    },
  },
  mounted() {
    this.fetchAdRequests();
  },
};
