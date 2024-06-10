// Chakra imports
import {
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Grid,
  GridItem,
  Progress,
  Box,
  Text,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
// Assets
// Custom components
import Card from "components/card/Card";
import MiniStatistics from "components/card/MiniStatistics";
import IconBox from "components/icons/IconBox";
import { HSeparator } from "components/separator/Separator";
import { useEffect, useState } from "react";
import { LuBuilding2 } from "react-icons/lu";
import { MdAddTask, MdContacts, MdLeaderboard } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { getApi } from "services/api";
import Chart from "components/charts/LineChart.js";
// import Chart from "../reports/components/chart";
import { HasAccess } from "../../../redux/accessUtils";
import PieChart from "components/charts/PieChart";
import CountUpComponent from "../../../../src/components/countUpComponent/countUpComponent";
import RevenueProgressBar from "components/navbar/RevenueProgressBar";
import MonthlyRevenueChart from "./components/MonthlyRevenueChart";
import { PiPhoneCallBold } from "react-icons/pi";

export default function UserReports() {
  // Chakra Color Mode
  const viewsState = HasAccess([
    "Contacts",
    "Task",
    "Lead",
    "Property",
    "Email",
    "Call",
    "Meeting",
  ]);
  const [
    contactsView,
    taskView,
    leadView,
    proprtyView,
    emailView,
    callView,
    meetingView,
  ] = viewsState;
  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const user = JSON.parse(localStorage.getItem("user"));

  const [revenue, setRevenue] = useState({
    totalRevenue: 0,
    target: 0,
  });

  const [task, setTask] = useState([]);
  const [contactData, setContactData] = useState([]);
  const [leadData, setLeadData] = useState([]);
  const [data, setData] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [callData, setCallData] = useState([]);

  const navigate = useNavigate();

  const fetchTasks = async () => {
    let taskData;
    // setTimeout(async () => {
    if (user.role === "superAdmin") {
      taskData = await getApi("api/task/");
    } else if (
      taskView?.create ||
      taskView?.update ||
      taskView?.delete ||
      taskView?.view
    ) {
      taskData = await getApi(`api/task/?createBy=${user._id}`);
    }

    setTask(taskData?.data);
  };

  const fetchContacts = async () => {
    let contact;
    if (user.role === "superAdmin") {
      contact = await getApi("api/contact/");
    } else if (
      contactsView?.create ||
      contactsView?.update ||
      contactsView?.delete ||
      contactsView?.view
    ) {
      contact = await getApi(`api/contact/?createBy=${user._id}`);
    }

    setContactData(contact?.data);
  };

  const fetchLeads = async () => {
    let lead;
    if (user.role === "superAdmin") {
      lead = await getApi("api/lead");
    } else if (
      leadView?.create ||
      leadView?.update ||
      leadView?.delete ||
      leadView?.view
    ) {
      lead = await getApi(
        `api/lead/?role=${user?.roles[0]?.roleName}&user=${user._id}`
      );
    }
    setLeadData(lead?.data);
  };

  const fetchCalls = async () => {
    let call;
    if (user.role === "superAdmin") {
      call = await getApi("api/phoneCall/");
    } else if (
      callView?.create ||
      callView?.update ||
      callView?.delete ||
      callView?.view
    ) {
      call = await getApi(`api/phoneCall/?sender=${user._id}`);
    }
    setCallData(call?.data);
  };

  const fetchProgressChart = async () => {
    let result = await getApi(
      user.role === "superAdmin"
        ? "api/reporting/line-chart"
        : `api/reporting/line-chart?createBy=${user._id}`
    );
    if (result && result.status === 200) {
      setData(result?.data);
    }
  };

  useEffect(() => {
    if (!viewsState?.every((view) => view === undefined) && !fetched) {
      fetchLeads();
      fetchTasks();
      fetchCalls();
      fetchContacts();
      fetchProgressChart();
      setFetched(true);
    }
  }, [viewsState]);

  const taskStatus = [
    {
      name: "Completed",
      status: "completed",
      length:
        (task &&
          task?.length > 0 &&
          task?.filter((item) => item?.status === "completed")?.length) ||
        0,
      color: "#4d8f3a",
    },
    {
      name: "Pending",
      status: "pending",
      length:
        (task &&
          task?.length > 0 &&
          task?.filter((item) => item?.status === "pending")?.length) ||
        0,
      color: "#a37f08",
    },
    {
      name: "In Progress",
      status: "inProgress",
      length:
        (task &&
          task?.length > 0 &&
          task?.filter((item) => item?.status === "inProgress")?.length) ||
        0,
      color: "#7038db",
    },
    {
      name: "Todo",
      status: "todo",
      length:
        (task &&
          task?.length > 0 &&
          task?.filter((item) => item?.status === "todo")?.length) ||
        0,
      color: "#1f7eeb",
    },
    {
      name: "On Hold",
      status: "onHold",
      length:
        (task &&
          task?.length > 0 &&
          task?.filter((item) => item?.status === "onHold")?.length) ||
        0,
      color: "#DB5436",
    },
  ];

  return (
    <>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap="20px" mb="20px">
        {/* , "2xl": 6 */}
        {(taskView?.create ||
          taskView?.update ||
          taskView?.delete ||
          taskView?.view) && (
          <MiniStatistics
            onClick={() => navigate("/task")}
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon w="28px" h="28px" as={MdAddTask} color={brandColor} />
                }
              />
            }
            name="Tasks"
            value={task?.length || 0}
          />
        )}
        {(contactsView?.create ||
          contactsView?.update ||
          contactsView?.delete ||
          contactsView?.view) && (
          <MiniStatistics
            onClick={() => navigate("/contacts")}
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon w="32px" h="32px" as={MdContacts} color={brandColor} />
                }
              />
            }
            name="Contacts"
            value={contactData?.length || 0}
          />
        )}
        {(leadView?.create ||
          leadView?.update ||
          leadView?.delete ||
          leadView?.view) && (
          <MiniStatistics
            onClick={() => navigate("/lead")}
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon
                    w="32px"
                    h="32px"
                    as={MdLeaderboard}
                    color={brandColor}
                  />
                }
              />
            }
            name="Leads"
            value={leadData?.length || 0}
          />
        )}
        {(callView?.create ||
          callView?.update ||
          callView?.delete ||
          callView?.view) && (
          <MiniStatistics
            onClick={() => navigate("/phone-call")}
            startContent={
              <IconBox
                w="56px"
                h="56px"
                bg={boxBg}
                icon={
                  <Icon w="32px" h="32px" as={PiPhoneCallBold} color={brandColor} />
                }
              />
            }
            name="Calls"
            value={callData?.length || 0}
          />
        )}
      </SimpleGrid>

      <Grid Grid templateColumns="repeat(12, 1fr)" gap={3}>
        {/* <GridItem rowSpan={2} colSpan={{ base: 12, md: 6 }}>
          <Card>
            <ReactApexChart options={options} series={[44, 55, 67, 83]} type="radialBar" height={350} />
          </Card>
        </GridItem>
        <GridItem rowSpan={2} colSpan={{ base: 12, md: 6 }}>
          <Card>
            <ReactApexChart options={options4} series={[71, 63, 77]} type="radialBar" height={350} />
          </Card>
        </GridItem> */}

        <GridItem rowSpan={2} colSpan={{ base: 12, md: 12 }}>
          <Card>
            <Flex mb={5} alignItems={"center"} justifyContent={"space-between"}>
              <Heading size="md">Report</Heading>
            </Flex>
            <Box mb={3}>
              <HSeparator />
            </Box>
            <Chart dashboard={"dashboard"} data={data} />
          </Card>
        </GridItem>
      </Grid>

      <Grid Grid templateColumns="repeat(12, 1fr)" mt={5} gap={3}>
        <GridItem rowSpan={2} colSpan={{ base: 8 }}>
          <Card>
            <Flex mb={5} alignItems={"center"} justifyContent={"space-between"}>
              <Heading size="md">Revenue Analytics</Heading>
            </Flex>
            <Box mb={3}>
              <HSeparator />
            </Box>
            <MonthlyRevenueChart dashboard={"dashboard"} data={data} />
          </Card>
        </GridItem>
        <GridItem rowSpan={2} justifyContent={"center"} colSpan={{ base: 4 }}>

            <div style={{
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              height: "100%"
            }}>
              <RevenueProgressBar />
            </div>
        </GridItem>
      </Grid>

      <SimpleGrid gap="20px" columns={{ base: 1, md: 2, lg: 3 }} my="20px">
        <Card>
          <Heading size="md" pb={3}>
            Statistics
          </Heading>
          {data &&
            data.length > 0 &&
            data?.map((item, i) => (
              <>
                {((item.name === "Lead" &&
                  (leadView?.create ||
                    leadView?.update ||
                    leadView?.delete ||
                    leadView?.view)) ||
                  (item.name === "Contact" &&
                    (contactsView?.create ||
                      contactsView?.update ||
                      contactsView?.delete ||
                      contactsView?.view)) ||
                  (item.name === "Meeting" &&
                    (meetingView?.create ||
                      meetingView?.update ||
                      meetingView?.delete ||
                      meetingView?.view)) ||
                  (item.name === "Call" &&
                    (callView?.create ||
                      callView?.update ||
                      callView?.delete ||
                      callView?.view)) ||
                  (item.name === "Email" &&
                    (emailView?.create ||
                      emailView?.update ||
                      emailView?.delete ||
                      emailView?.view)) ||
                  (item.name === "Property" &&
                    (proprtyView?.create ||
                      proprtyView?.update ||
                      proprtyView?.delete ||
                      proprtyView?.view)) ||
                  (item.name === "Task" &&
                    (taskView?.create ||
                      taskView?.update ||
                      taskView?.delete ||
                      taskView?.view))) && (
                  <Box border={"1px solid #e5e5e5"} p={2} m={1} key={i}>
                    <Flex justifyContent={"space-between"}>
                      <Text fontSize="sm" fontWeight={600} pb={2}>
                        {item?.name}
                      </Text>
                      <Text fontSize="sm" fontWeight={600} pb={2}>
                        <CountUpComponent targetNumber={item?.length} />
                      </Text>
                    </Flex>
                    <Progress
                      colorScheme={item?.color}
                      size="xs"
                      value={item?.length}
                      width={"100%"}
                    />
                  </Box>
                )}
              </>
            ))}
        </Card>

        <Card>
          <Heading size="md" pb={2}>
            Lead Statistics
          </Heading>
          {(leadView?.create ||
            leadView?.update ||
            leadView?.delete ||
            leadView?.view) && (
            <Grid templateColumns="repeat(12, 1fr)" gap={2}>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Box
                  backgroundColor={"#ebf5ff"}
                  borderRadius={"10px"}
                  p={2}
                  m={1}
                  textAlign={"center"}
                >
                  <Heading size="sm" pb={3} color={"#1f7eeb"}>
                    Total Leads{" "}
                  </Heading>
                  <Text fontWeight={600} color={"#1f7eeb"}>
                    <CountUpComponent targetNumber={leadData?.length || 0} />{" "}
                  </Text>
                </Box>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Box
                  backgroundColor={"#ebf5ff"}
                  borderRadius={"10px"}
                  p={2}
                  m={1}
                  textAlign={"center"}
                >
                  <Heading size="sm" pb={3} color={"#1f7eeb"}>
                    New Leads{" "}
                  </Heading>
                  <Text fontWeight={600} color={"#1f7eeb"}>
                    <CountUpComponent
                      targetNumber={
                        (leadData &&
                          leadData.length > 0 &&
                          leadData?.filter((lead) => lead?.leadStatus === "new" || lead?.leadStatus === "")
                            ?.length) ||
                        0
                      }
                    />
                  </Text>
                </Box>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Box
                  backgroundColor={"#eaf9e6"}
                  borderRadius={"10px"}
                  p={2}
                  m={1}
                  textAlign={"center"}
                >
                  <Heading size="sm" pb={3} color={"#43882f"}>
                    Interested Leads{" "}
                  </Heading>
                  <Text fontWeight={600} color={"#43882f"}>
                    <CountUpComponent
                      targetNumber={
                        (leadData &&
                          leadData.length > 0 &&
                          leadData?.filter(
                            (lead) => lead?.leadStatus === "active"
                          )?.length) ||
                        0
                      }
                    />
                  </Text>
                </Box>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Box
                  backgroundColor={"#fbf4dd"}
                  borderRadius={"10px"}
                  p={2}
                  m={1}
                  textAlign={"center"}
                >
                  <Heading size="sm" pb={3} color={"#a37f08"}>
                    Not-interested Leads
                  </Heading>
                  <Text fontWeight={600} color={"#a37f08"}>
                    <CountUpComponent
                      targetNumber={
                        (leadData &&
                          leadData.length > 0 &&
                          leadData?.filter(
                            (lead) => lead?.leadStatus === "pending"
                          )?.length) ||
                        0
                      }
                    />
                  </Text>
                </Box>
              </GridItem>

              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Box
                  backgroundColor={"#ffeeeb"}
                  borderRadius={"10px"}
                  p={2}
                  m={1}
                  textAlign={"center"}
                >
                  <Heading size="sm" pb={3} color={"#d6401d"}>
                    Sold Leads{" "}
                  </Heading>
                  <Text fontWeight={600} color={"#d6401d"}>
                    <CountUpComponent
                      targetNumber={
                        (leadData &&
                          leadData.length > 0 &&
                          leadData?.filter(
                            (lead) => lead?.leadStatus === "sold"
                          )?.length) ||
                        0
                      }
                    />
                  </Text>
                </Box>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Box
                  backgroundColor={"#ffeeeb"}
                  borderRadius={"10px"}
                  p={2}
                  m={1}
                  textAlign={"center"}
                >
                  <Heading size="sm" pb={3} color={"#d6401d"}>
                    Unreachable{" "}
                  </Heading>
                  <Text fontWeight={600} color={"#d6401d"}>
                    <CountUpComponent
                      targetNumber={
                        (leadData &&
                          leadData.length > 0 &&
                          leadData?.filter(
                            (lead) => lead?.leadStatus === "unreachable"
                          )?.length) ||
                        0
                      }
                    />
                  </Text>
                </Box>
              </GridItem>
              <GridItem colSpan={{ base: 12, md: 6 }}>
                <Box
                  backgroundColor={"#ffeeeb"}
                  borderRadius={"10px"}
                  p={2}
                  m={1}
                  textAlign={"center"}
                >
                  <Heading size="sm" pb={3} color={"#d6401d"}>
                    No Answer{" "}
                  </Heading>
                  <Text fontWeight={600} color={"#d6401d"}>
                    <CountUpComponent
                      targetNumber={
                        (leadData &&
                          leadData.length > 0 &&
                          leadData?.filter(
                            (lead) => lead?.leadStatus === "no_answer"
                          )?.length) ||
                        0
                      }
                    />
                  </Text>
                </Box>
              </GridItem>
            </Grid>
          )}
          <Flex mt={5} justifyContent={"center"}>
            <PieChart leadData={leadData} />
          </Flex>
        </Card>

        <Card>
          <Heading size="md" pb={3}>
            Task Statistics
          </Heading>
          <Grid templateColumns="repeat(12, 1fr)" gap={2} mb={2}>
            <GridItem colSpan={{ base: 12 }}>
              <Box
                backgroundColor={"#ebf5ff"}
                borderRadius={"10px"}
                p={2}
                m={1}
                textAlign={"center"}
              >
                <Heading size="sm" pb={3} color={"#1f7eeb"}>
                  Total Tasks{" "}
                </Heading>
                <Text fontWeight={600} color={"#1f7eeb"}>
                  <CountUpComponent targetNumber={task?.length || 0} />
                </Text>
              </Box>
            </GridItem>
          </Grid>
          {taskStatus &&
            taskStatus.length > 0 &&
            taskStatus?.map((item) => (
              <Box my={1.5}>
                <Flex
                  justifyContent={"space-between"}
                  cursor={"pointer"}
                  onClick={() => navigate("/task", { state: item.status })}
                  alignItems={"center"}
                  padding={4}
                  backgroundColor={"#0b0b0b17"}
                  borderRadius={"10px"}
                >
                  <Flex alignItems={"center"}>
                    <Box
                      height={"18px"}
                      width={"18px"}
                      lineHeight={"18px"}
                      textAlign={"center"}
                      border={`1px solid ${item.color}`}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      borderRadius={"50%"}
                      margin={"0 auto"}
                    >
                      <Box
                        backgroundColor={`${item.color}`}
                        height={"10px"}
                        width={"10px"}
                        borderRadius={"50%"}
                      ></Box>
                    </Box>

                    <Text ps={2} fontWeight={"bold"} color={`${item.color}`}>
                      {item.name}
                    </Text>
                  </Flex>
                  <Box fontWeight={"bold"} color={`${item.color}`}>
                    <CountUpComponent targetNumber={item?.length} />
                  </Box>
                </Flex>
              </Box>
            ))}
        </Card>
      </SimpleGrid>
    </>
  );
}
