import { useEffect, useState, useContext } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  CardMedia,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../App";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, token } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState({
    jobType: "",
    keyword: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/api/jobs",{
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(response.data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setError(error.response?.data?.message || "Failed to fetch jobs.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchJobs();
    }
  }, [isAuthenticated,token]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesJobType = !filter.jobType || job.jobType === filter.jobType;
    const matchesKeyword =
      !filter.keyword ||
      job.title.toLowerCase().includes(filter.keyword.toLowerCase()) ||
      job.company.toLowerCase().includes(filter.keyword.toLowerCase());

    return matchesJobType && matchesKeyword;
  });

  const handleEdit = (jobId) => {
    navigate(`/edit-job/${jobId}`);
  };

  const handleDelete = async (jobId) => {
    try {
      await axios.delete(`/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(jobs.filter((job) => job._id !== jobId));
    } catch (error) {
      console.error("Error deleting job:", error);
      setError(error.response?.data?.message || "Failed to delete job.");
    }
  };

  return (
    <div>
      <AppBar
        position="static"
        sx={{ bgcolor: "primary.main", color: "white" }}
      >
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, flexShrink:0 }}>
            Job Portal
          </Typography>

          <Box sx={{display:'flex', flexDirection:{xs:"column", md:"row"}, mt:{xs:'4px', md:"0px"}}}>
            <Button
              size="large"
              color="secondary"
              variant="contained"
              component={Link}
              to={`/create-job`}
              sx={{ mr: "8px" }}
            >
              Create job
            </Button>
            <Button onClick={logout} color="inherit" size="large">
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md">
        <Box mt={4}>
          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Find Your Next Opportunity
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Explore thousands of job postings and discover your dream career.
            </Typography>
          </Box>

          {/* Filtering Options */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="jobType-label">Job Type</InputLabel>
                <Select
                  labelId="jobType-label"
                  id="jobType"
                  name="jobType"
                  value={filter.jobType}
                  label="Job Type"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Full-time">Full-time</MenuItem>
                  <MenuItem value="Part-time">Part-time</MenuItem>
                  {/* Add more options as needed */}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Search by Keyword"
                name="keyword"
                value={filter.keyword}
                onChange={handleFilterChange}
              />
            </Grid>
          </Grid>

          {/* Error Alert */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Loading Spinner */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "300px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            // Job Listings
            <Grid container my={2} spacing={3}>
              {filteredJobs.map((job) => (
                <Grid item xs={12} boxShadow={"8px"} key={job._id} >
                  <Card sx={{display:'flex', flexDirection:{
                  xs:'column', md:'row'
                }}}>
                    <CardMedia
                      component="img"
                      sx={{ width: {xs:'100%', md:'150px'}, height: {xs:'200px'}, objectFit: "cover" }}
                      image={"https://placehold.co/150x200"}
                      alt={`${job.company} logo`}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" component="div">
                          {job.title}
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {job.company} - {job.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {job.description.slice(0, 150)}...
                        </Typography>
                      </CardContent>
                      <CardActions
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "end",
                          gap: "4px",
                        }}
                      >
                        <Tooltip title="Edit Job">
                          <IconButton onClick={() => handleEdit(job._id)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Job">
                          <IconButton onClick={() => handleDelete(job._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </div>
  );
};

export default HomePage;
