export default {
  template: `
    <div class="container mt-5">
      <h1 class="text-center mb-4">Sponsor Dashboard</h1>

      <div v-if="loading" class="text-center">
        <p>Loading...</p>
      </div>

      <div v-if="!loading && error" class="text-center text-danger">
        <p>{{ error }}</p>
      </div>

      <div v-if="!loading && !error">
        <div class="row mb-3">
          <div class="col-md-4">
            <div class="card text-white bg-primary mb-3">
              <div class="card-header">Total Campaigns</div>
              <div class="card-body">
                <h5 class="card-title">{{ dashboardStats.total_campaigns }}</h5>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-white bg-success mb-3">
              <div class="card-header">Total Ad Requests</div>
              <div class="card-body">
                <h5 class="card-title">{{ dashboardStats.total_ad_requests }}</h5>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-white bg-danger mb-3">
              <div class="card-header">Campaign Statuses</div>
              <div class="card-body">
                <ul>
                  <li>Proposed: {{ dashboardStats.proposed_campaigns }}</li>
                  <li>Accepted: {{ dashboardStats.accepted_campaigns }}</li>
                  <li>Rejected: {{ dashboardStats.rejected_campaigns }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="row mb-3">
          <div class="col-md-4">
            <div class="card bg-light mb-3">
              <div class="card-header">Ongoing Campaigns</div>
              <div class="card-body">
                <ul>
                  <li v-for="campaign in dashboardStats.ongoing_campaigns" :key="campaign.id">
                    {{ campaign.name }} - Start Date: {{ campaign.start_date }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card bg-light mb-3">
              <div class="card-header">New Ad Requests</div>
              <div class="card-body">
                <ul>
                  <li v-for="request in dashboardStats.new_ad_requests" :key="request.id">
                    Campaign: {{ request.campaign_name }} - Requested By: {{ request.requested_by }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center mt-4">
          <button class="btn btn-primary" @click="exportCsv">Export Campaign Data</button>
          <div v-if="exportStatus" class="mt-2">
            <p>{{ exportStatus.message }}</p>
            <button v-if="exportStatus.ready" class="btn btn-success" @click="downloadCsv">Download CSV</button>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      dashboardStats: {
        total_campaigns: 0,
        total_ad_requests: 0,
        proposed_campaigns: 0,
        accepted_campaigns: 0,
        rejected_campaigns: 0,
        ongoing_campaigns: [],
        new_ad_requests: [],
        // ... other data
      },
      loading: true,
      error: null,
      exportStatus: null,  // To track CSV export status
      taskId: null  // To store the task ID for checking status
    };
  },
  mounted() {
    this.fetchDashboardData();
    this.checkStoredTaskStatus();
  },
  methods: {
    async fetchDashboardData() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch('/api/sponsor/dashboard', {
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        this.dashboardStats = {
          ...data,
          ongoing_campaigns: data.ongoing_campaigns || [],
          new_ad_requests: data.new_ad_requests || []
        };
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async exportCsv() {
      this.exportStatus = null;
      
      try {
        const response = await fetch('/api/sponsor/export_campaign_data_csv', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to initiate CSV export');
        }

        const data = await response.json();
        this.taskId = data['task-id'];
        localStorage.setItem('csv-task-id', this.taskId); // Store task ID in local storage
        this.checkExportStatus();
      } catch (error) {
        this.error = error.message;
      }
    },
    async checkExportStatus() {
      if (!this.taskId) return;

      try {
        const response = await fetch(`/api/sponsor/export_campaign_data_csv/${this.taskId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          }
        });

        if (response.status === 202) {
          const data = await response.json();
          this.exportStatus = {
            ready: false,
            message: data.message || 'CSV export is still processing.'
          };

          // Check status again after some delay
          setTimeout(this.checkExportStatus, 5000);
        } else if (response.ok) {
          this.exportStatus = {
            ready: true,
            message: 'CSV export is ready. You can download it now.'
          };
        } else {
          throw new Error('Unexpected response status');
        }
      } catch (error) {
        this.error = error.message;
      }
    },
    async downloadCsv() {
      if (!this.taskId) return;

      try {
        const response = await fetch(`/api/sponsor/export_campaign_data_csv/${this.taskId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': localStorage.getItem('token')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to download CSV');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'campaign_data.csv';
        a.click();
        window.URL.revokeObjectURL(url);

        // Clear task ID from local storage
        localStorage.removeItem('csv-task-id');
      } catch (error) {
        this.error = error.message;
      }
    },
    checkStoredTaskStatus() {
      const storedTaskId = localStorage.getItem('csv-task-id');
      if (storedTaskId) {
        this.taskId = storedTaskId;
        this.checkExportStatus();
      }
    }
  }
};
