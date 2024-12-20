import React from "react";
import LineChart1 from "../LineChart1";
import Chart from "react-apexcharts";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductService } from "../../features/product_serviceSlice";
import { getAllAgent ,getAllAgentWithData} from "../../features/agentSlice";
import { getAllLeadSource } from "../../features/leadSource";
import { getAllStatus } from "../../features/statusSlice";
import DataTable from "react-data-table-component";
import toast from "react-hot-toast";
import randomcolor from 'randomcolor';
export default function Incomereport() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const DBuUrl = process.env.REACT_APP_DB_URL;
  const [data, setdata] = useState([]);
  const [total, settotal] = useState([]);
  const { ProductService } = useSelector((state) => state.ProductService);
  const { Statusdata } = useSelector((state) => state.StatusData);
  const { leadSourcedata } = useSelector((state) => state.leadSource);
  var { agent } = useSelector((state) => state.agent);
  const [leadsource, setleadsource] = useState([]);
  const [leadsourcedata1, setleadsourcedata] = useState([]);
  const dispatch = useDispatch();
  const [llll, setllll] = useState('block');
  const [llll1, setllll1] = useState('none');
  
  const [agentss, setAgents] = useState([]);

  // console.log("agentssssssssstlllll",agentss)
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // const response = await axios.get(agentsApiUrl);
        const response = await axios.get( `${apiUrl}/get_all_agent/`);
        console.log('API response:', response.data);
        if (response.data.success) {
          const agentsData = response.data.agent || []; 
          console.log('Agents data:', agentsData);
          setAgents(agentsData);
        } else {
          toast.warn(response.data.message);
        }
      } catch (error) {
        toast.warn("Error fetching agents");
      }
    };

    fetchAgents();
  }, []);

  const getAllLeadSourceOverview1 = async () => {
    try {
      const responce = await axios.post(
        `${apiUrl}/EmployeesReportDetail`, {
        headers: {
          "Content-Type": "application/json",
          "mongodb-url": DBuUrl,
            Authorization: "Bearer " + localStorage.getItem("token"),

        }
      }
      );
      setleadsourcedata(responce?.data?.value);
      setleadsource(responce?.data?.name);

    } catch (error) {
     
      console.log(error);
    }
  }
  const getAllLeadSourceOverview2 = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/EmployeesReportDetail`,
        { assign_to_agent: localStorage.getItem('user_id') },
        {
          headers: {
            'Content-Type': 'application/json',
            'mongodb-url': DBuUrl,
          },
        }
      );
  
      setleadsourcedata(response?.data?.value);
      setleadsource(response?.data?.name);
    } catch (error) {
     
      console.error(error);
    }
  };
  
  const getAllLeadSourceOverview3 = async () => {
    try {
      const response = await axios.post(
        `${apiUrl}/EmployeesReportGroupDetail`,
        { assign_to_agent: localStorage.getItem('user_id') },
        {
          headers: {
            'Content-Type': 'application/json',
            'mongodb-url': DBuUrl,
          },
        }
      );
  
      setleadsourcedata(response?.data?.value);
      setleadsource(response?.data?.name);
    } catch (error) {
     
      console.error(error);
    }
  };
  
  useEffect(() => {
   

    dispatch(getAllProductService());
    dispatch(getAllLeadSource());
    // dispatch(getAllAgent());
    dispatch(getAllStatus());
    if(localStorage.getItem("role")==='admin'){
      dispatch(getAllAgent());
      getAllLeadSourceOverview1();
     }
     if (localStorage.getItem("role")==='TeamLeader') {   
      dispatch(getAllAgentWithData({assign_to_agent:localStorage.getItem("user_id")}));
      getAllLeadSourceOverview2({assign_to_agent:localStorage.getItem("user_id")});
    }
    if (localStorage.getItem("role")==='GroupLeader') {   
      dispatch(getAllAgentWithData({assign_to_agent:localStorage.getItem("user_id")}));
      getAllLeadSourceOverview3({assign_to_agent:localStorage.getItem("user_id")});
      // getAllLeadSourceOverview1();
    }
    if(localStorage.getItem("role")==='user'){
      dispatch(getAllAgent({assign_to_agent:localStorage.getItem("user_id")}));
     }
  }, []);
  
  const colors = randomcolor({ count: leadsourcedata1.length });
  const options = {
    labels: leadsource,
    colors: colors,
  };


  const [submittedAgentName, setSubmittedAgentName] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [getLeadData, setLeadData] = useState([]);
  const [getLeadData1, setLeadData1] = useState([]);
  
  const getEmployeeReport = async (e) => {
    e.preventDefault();
    const data1={...data,role:localStorage.getItem("role"),user_id:localStorage.getItem("user_id")}
    const headers = {
      "Content-Type": "application/json",
      "mongodb-url": DBuUrl,
            Authorization: "Bearer " + localStorage.getItem("token"),

    };
    try {
      const responce = await axios.post(
        `${apiUrl}/EmployeesReportDetailByFilter1`,
        data1,
        { headers }
      );
      setLeadData(responce?.data?.lead);
      setLeadData1(responce?.data?.data);
      toast(responce?.data?.message);
      setllll('none')
      setllll1('block')

      const selectedAgent = agent?.agent?.find((agents) => agents._id === data.agent);
    setSubmittedAgentName(selectedAgent?.agent_name || ""); // Set the selected agent's name
    setIsSubmitted(true); // Mark the form as submitted

    } catch (error) {
      setLeadData();
      toast(error?.response?.data?.message);
    }
  };
  const columns = [
    {
      name: "Sr. No.",
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: "GM",
      selector: (row) => {
        if (Array.isArray(agentss)) {
       
          const teamLeader = agentss.find((agents) => agents._id === row?.assign_to_agent && agents.role === "TeamLeader");
    
          
          const matchingAgent = agentss.find((agents) => agents._id === row?.assign_to_agent);
    
        if (matchingAgent) {
         
          if (matchingAgent.role === "GroupLeader") {
            return `${matchingAgent.agent_name}`;
          }
          if (matchingAgent.role === "TeamLeader") {
            return matchingAgent.agent_details.length > 0
              ? matchingAgent.agent_details[0].agent_name
              : "";
          }
          if (matchingAgent.role === "user") {
            const userAgentDetails = matchingAgent.agent_details;
    
            if (userAgentDetails.length > 0) {
              const teamLeader = agentss.find(
                (agent) => agent._id === userAgentDetails[0]._id && agent.role === "TeamLeader"
              );
              if (teamLeader.role === "TeamLeader") {
                return teamLeader.agent_details.length > 0 
                ? teamLeader.agent_details[0].agent_name 
                : "";
              }
            }
          }
        }
          return "No Team Leader"; // Return if no Team Leader was found
        } else {
          return "Agent data unavailable"; // Handle the case where agent is not an array
        }
      },
      sortable: true,
    },
    {
      name: "TL",
      selector: (row) => {
        if (Array.isArray(agentss)) {
          const matchingAgent = agentss.find((agents) => agents._id === row?.assign_to_agent);

          if (matchingAgent) {
            if (matchingAgent.role === "TeamLeader") {
              return matchingAgent.agent_name;
            }
            if (matchingAgent.role === "GroupLeader") {
              return `${matchingAgent.agent_name} (GM)`; 
            }
           
            if (matchingAgent.role === "user") {
              return matchingAgent.agent_details && matchingAgent.agent_details.length > 0 
                ? matchingAgent.agent_details[0].agent_name 
                : " "; 
            }
          }
    
          
          return " ";
        } else {
          return "Agent data unavailable"; // Handle case where agentss is not an array
        }
      },
      sortable: true,
    },
      {
        name: "User",
        // selector: (row) => row?.assign_to_agent,
        selector: (row) => {
          if (Array.isArray(agentss)) {
            // Find the agent by ID and check their role
            const userAgent = agentss.find((agents) => agents._id === row?.assign_to_agent && agents.role === "user");
            return userAgent ? userAgent.agent_name : "";
          } else {
            return ""; 
          }
        },
        sortable: true,
      },
      {
      name: "Client Name",
      selector: (row) => row?.full_name,
      sortable: true,
    },
    {
      name: "Lead Price",
      selector: (row) => row?.followup_won_amount,
      sortable: true,
    },
  ];
  const customStyles = {
    cells: {
      style: {
        border: "1px solid #ddd", // Set the cell border
        fontSize: "14px",
      },
    },
    headCells: {
      style: {
        border: "1px solid #111", // Set the header cell border
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        borderRight: "none", // Remove vertical borders
      },
    },
  };

  const Refresh = () => {
    setTimeout(() => {
      window.location.reload(false);
    }, 500);
  };


  return (
    <div>
      <div className="content-wrapper">
        <section className="content">
          <div className="container pl-0">
            <div className="row pl-0 pr-0">
              <div className="col-12 pl-0 pr-0">
                <div className="panel-body pt-2">
                  <div className="panel panel-bd lobidrag lobipanel">
                    <div className="panel-heading">
                      <div className="btn-group bg-white ">
                        <h4>Income Report</h4>
                      </div>

                    </div>

                    <div className="pt-3">
                      <div className="  bg-white">
                        <div className="col-sm-12 col-md-12 col-xs-12">
                          <div className="cards pt-3 ">
                            <div className="serach-lists" style={{ padding: 0 }}>
                              <form onSubmit={getEmployeeReport}>
                                <div className="row">
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <select className="form-control"
                                        onChange={(e) =>
                                          setdata({
                                            ...data,
                                            service: e.target.value,
                                          })
                                        }
                                        name="service">
                                        <option value="">Select product</option>

                                        {ProductService?.product_service?.map(
                                          (ProductService1) => {
                                            return (
                                              <option value={ProductService1?._id}>
                                                {
                                                  ProductService1?.product_service_name
                                                }
                                              </option>
                                            );
                                          }
                                        )}
                                      </select>
                                    </div>
                                  </div>

                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <select className="form-control"
                                        onChange={(e) =>
                                          setdata({
                                            ...data,
                                            lead_source: e.target.value,
                                          })
                                        }
                                        name="lead_source">
                                        <option value="">Select Lead Source</option>
                                        {leadSourcedata?.leadSource?.map(
                                          (leadSource1) => {
                                            return (
                                              <option value={leadSource1?._id}>
                                                {
                                                  leadSource1?.lead_source_name
                                                }
                                              </option>
                                            );
                                          }
                                        )}
                                      </select>
                                    </div>
                                  </div>

                                  <div className="col-md-4">
                                    <div className="form-group">
                                      <select className="form-control"
                                        onChange={(e) =>
                                          setdata({
                                            ...data,
                                            status: e.target.value,
                                          })
                                        }
                                        name="status">
                                        <option value="">Select Status</option>
                                        {Statusdata?.leadstatus?.map((status, key) => {
                                          return (
                                            <option value={status._id}>{status.status_name}</option>
                                          );
                                        })}
                                      </select>
                                    </div>
                                  </div>
                                  <div className="col-md-4">
                                    <div className="form-group">
                                      {/* <select
                                        className="form-control"
                                        name="agent"
                                        onChange={(e) =>
                                          setdata({
                                            ...data,
                                            agent: e.target.value,
                                          })
                                        }
                                        
                                      >
                                        <option value="">Select Employee</option>

                                        {agent?.agent?.map((agents, key) => {
                                          return (
                                            <option value={agents._id}>
                                              {agents.agent_name}  ({agents.role})
                                            </option>
                                          );
                                        })}
                                      </select> */}
                                      <select
                                                className="form-control"
                                                name="agent"
                                                onChange={(e) =>
                                                  setdata({
                                                    ...data,
                                                    agent: e.target.value,
                                                  })
                                                }
                                              >
                                                <option value="">Select Employee</option>

                                                {agent?.agent?.map((agents, key) => {
                                                  // If the logged-in user is 'admin', only show 'GroupLeader' options
                                                  if (localStorage.getItem("role") === 'admin') {
                                                    if (agents.role === 'GroupLeader') {
                                                      return (
                                                        <option key={key} value={agents._id}>
                                                          {agents.agent_name} ({agents.role})
                                                        </option>
                                                      );
                                                    }
                                                  } else {
                                                    // For non-admin roles, display all agents
                                                    return (
                                                      <option key={key} value={agents._id}>
                                                        {agents.agent_name} ({agents.role})
                                                      </option>
                                                    );
                                                  }

                                                  return null; // Return null for non-GroupLeader agents when role is admin
                                                })}
                                              </select>

                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="form-group">
                                      <input
                                        name="startDate"
                                        onChange={(e) =>
                                          setdata({
                                            ...data,
                                            startDate: e.target.value,
                                          })
                                        }
                                        placeholder="Choose Date From"
                                        type="date"
                                        className="form-control"
                                        autoComplete="off"
                                        defaultValue=""
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="form-group">
                                      <input
                                        onChange={(e) =>
                                          setdata({
                                            ...data,
                                            endDate: e.target.value,
                                          })
                                        }
                                        name="endDate"
                                        placeholder="Choose Date To"
                                        type="date"
                                        className="form-control"
                                        autoComplete="off"
                                        defaultValue=""
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-2 col-sm-12">
                                    <div className="form-group">
                                      <button
                                        type="submit"
                                        className="btn btn-success button-57 form-control"
                                      >
                                        Submit
                                      </button>
                                    </div>
                                  </div>
                                  <div className="col-md-2 col-sm-12" style={{ display: llll1 }} >
                                    <div className="form-group">
                                      <button onClick={Refresh}
                                        type="button"
                                        className="btn btn-success button-57 form-control"
                                      >
                                        Refresh
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </form>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-12">
                            <div className="col-lg-6 mx-auto">
                              <Chart options={options} series={leadsourcedata1} type="pie"
                                style={{ width: '500px', height: '500px', display: llll }} />
                            </div>
                          </div>
                          </div>

                      {
                        getLeadData1.length>0?(<>
                        <div className="row">
                         <div class="col-3">
                          <div class="button-30 border-lefts1 mb-4">
                            <div class="heading_lead py-2 pt-2">
                              <h5>Total</h5>
                              <p>{getLeadData1[0].Total}</p>
                            </div>
                          </div>
                        </div>
                          <div class="col-3">
                          <div class="button-30 border-lefts1 mb-4">
                            <div class="heading_lead py-2 pt-2">
                              <h5>Won</h5>
                              <p>{getLeadData1[0].Won}</p>
                            </div>
                          </div>
                        </div>
                         <div class="col-3">
                          <div class="button-30 border-lefts1 mb-4">
                            <div class="heading_lead py-2 pt-2">
                            <h5>Ratio</h5>
                              <p>{getLeadData1[0].Ratio}</p>
                            </div>
                          </div>
                        </div>
                        <div class="col-3">
                          <div class="button-30 border-lefts1 mb-4">
                            <div class="heading_lead py-2 pt-2">
                            <h5>Amount</h5>
                              <p>{getLeadData1[0].Amount}</p>
                            </div>
                          </div>
                        </div></div>
                        </>):(<></>) 
                      }
                        
                        <div className="card-headers">
                        {isSubmitted && submittedAgentName && (
                          <h4>Assign To : {submittedAgentName}</h4>
                        )}
                          <DataTable
                            className="custom-datatable"
                            responsive
                            id="table-to-export"
                            columns={columns}
                            data={getLeadData}
                            pagination
                            fixedHeader
                            fixedHeaderScrollHeight="550px"
                            selectableRowsHighlight
                            highlightOnHover
                            subHeader   
                            customStyles={customStyles}
                          />
                        </div>
                      </div>
                    </div></div>
                </div></div>
            </div></div>
        </section>
      </div>
    </div>
  );
}
