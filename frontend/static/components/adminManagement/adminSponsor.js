export default {
  template: `
    <div>
      <h1>Sponsor Management</h1>
      <div class="row mb-3">
        <div class="col-md-4">
          <label for="industry-filter" class="form-label">Industry:</label>
          <input type="text" id="industry-filter" v-model="filters.industry" @input="fetchSponsors" class="form-control" />
        </div>
        <div class="col-md-4">
          <label for="approval-status-filter" class="form-label">Approval Status:</label>
          <select id="approval-status-filter" v-model="filters.approval_status" @change="fetchSponsors" class="form-select">
            <option value="">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div class="col-md-4">
          <label for="flag-status-filter" class="form-label">Flag Status:</label>
          <select id="flag-status-filter" v-model="filters.is_flagged" @change="fetchSponsors" class="form-select">
            <option value="">All</option>
            <option value="true">Flagged</option>
            <option value="false">Not Flagged</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div v-for="sponsor in filteredSponsors" :key="sponsor.id" class="col-md-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ sponsor.company_name }}</h5>
              <p class="card-text"><strong>Industry:</strong> {{ sponsor.industry }}</p>
              <p class="card-text"><strong>Approval Status:</strong> {{ sponsor.approval_status }}</p>
              <p class="card-text"><strong>Flag Status:</strong> {{ sponsor.is_flagged ? 'Flagged' : 'Not Flagged' }}</p>
              <div class="d-flex justify-content-between">
                <button @click="approveSponsor(sponsor.id)" class="btn btn-success btn-sm">Approve</button>
                <button @click="rejectSponsor(sponsor.id)" class="btn btn-danger btn-sm">Reject</button>
                <button @click="toggleFlagSponsor(sponsor.id, sponsor.is_flagged)" class="btn btn-warning btn-sm">
                  {{ sponsor.is_flagged ? 'Unflag' : 'Flag' }}
                </button>              
                <router-link :to="'/sponsor/' + sponsor.id" class="btn btn-info btn-sm mt-2">View</router-link>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      sponsors: [],
      filters: {
        industry: '',
        approval_status: '',
        is_flagged: '',
      },
    };
  },
  computed: {
    filteredSponsors() {
      return this.sponsors;
    },
  },
  methods: {
    async fetchSponsors() {
      try {
        const params = new URLSearchParams({
          industry: this.filters.industry,
          approval_status: this.filters.approval_status,
          is_flagged: this.filters.is_flagged,
        }).toString();

        console.log(`Fetching sponsors with params: ${params}`);

        const res = await fetch(`/api/sponsor?${params}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
        });

        if (res.ok) {
          const data = await res.json();
          console.log('Fetched sponsors:', data);
          this.sponsors = data;
        } else {
          console.error('Error fetching sponsors:', res.statusText);
        }
      } catch (error) {
        console.error('Error in fetchSponsors method:', error);
      }
    },
    async approveSponsor(id) {
      console.log(`Approving sponsor with id: ${id}`);
      await this.updateSponsorApproval(id, 'approved');
    },
    async rejectSponsor(id) {
      console.log(`Rejecting sponsor with id: ${id}`);
      await this.updateSponsorApproval(id, 'rejected');
    },
    async toggleFlagSponsor(id, is_flagged) {
      console.log(`Toggling flag for sponsor with id: ${id}, current flag status: ${is_flagged}`);
      await this.updateSponsorFlag(id, !is_flagged);
    },
    async updateSponsorApproval(id, approval_status) {
      console.log(`Updating sponsor approval: id=${id}, approval_status=${approval_status}`);
      try {
        const res = await fetch('/api/admin/sponsor/approval', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
          body: JSON.stringify({ id, approval_status }),
        });

        if (res.ok) {
          console.log('Approval updated successfully');
          await this.fetchSponsors();
        } else {
          console.error('Error updating sponsor approval:', res.statusText);
        }
      } catch (error) {
        console.error('Error in updateSponsorApproval method:', error);
      }
    },
    async updateSponsorFlag(id, is_flagged) {
      console.log(`Updating sponsor flag: id=${id}, is_flagged=${is_flagged}`);
      try {
        const res = await fetch('/api/admin/sponsor/flag', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token'),
          },
          body: JSON.stringify({ id, is_flagged }),
        });

        if (res.ok) {
          console.log('Flag updated successfully');
          await this.fetchSponsors();
        } else {
          console.error('Error updating sponsor flag:', res.statusText);
        }
      } catch (error) {
        console.error('Error in updateSponsorFlag method:', error);
      }
    },
  },
  mounted() {
    this.fetchSponsors();
  },
};
