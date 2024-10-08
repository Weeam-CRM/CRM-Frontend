import { AddIcon } from "@chakra-ui/icons";
import {
  Button,
  CircularProgress,
  Flex,
  FormLabel,
  Grid,
  GridItem,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";
import ContactModel from "components/commonTableModel/ContactModel";
import LeadModel from "components/commonTableModel/LeadModel";
import Spinner from "components/spinner/Spinner";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { LiaMousePointerSolid } from "react-icons/lia";
import { phoneCallSchema } from "schema";
import { getApi, postApi } from "services/api";

const AddPhoneCall = (props) => {
  const { onClose, isOpen, setAction } = props;
  const [isLoding, setIsLoding] = useState(false);
  const [assignmentToData, setAssignmentToData] = useState([]);
  const [contactModelOpen, setContactModel] = useState(false);
  const [leadModelOpen, setLeadModel] = useState(false);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const [duplicateLeads, setDuplicateLeads] = useState([]);

  const initialValues = {
    sender: user?._id,
    recipient: "",
    callDuration: "",
    callNotes: "",
    createBy: "",
    createByLead: "",
    startDate: new Date(),
    endDate: "",
    category: "contact",
    assignmentTo: "",
    assignmentToLead: "",
  };
  const tree = useSelector((state) => state.user.tree);
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: phoneCallSchema,
    onSubmit: (values, { resetForm }) => {
      AddData();
      resetForm();
    },
  });
  const {
    errors,
    touched,
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = formik;

  const AddData = async () => {
    try {
      setIsLoding(true);
      let response = await postApi("api/phoneCall/add", values);
      if (response.status === 200) {
        props.onClose();
        setAction((pre) => !pre);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoding(false);
    }
  };

  const fetchLeads = async () => {
    values.start = props?.date;
    try {
      let result;
      setLoading(true);
      if (values.category === "Contact") {
        result = await getApi(
          user.role === "superAdmin"
            ? "api/contact/"
            : `api/contact/?createBy=${user._id}`
        );
      } else if (values.category === "Lead") {
        result = await getApi(
          user.role === "superAdmin"
            ? "api/lead/"
            : `api/lead/?user=${user?._id}&role=${user?.roles[0]?.roleName}`
        );
      }
      setAssignmentToData(result?.data);
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [props?.date, values.category]);

  const fetchRecipientData = async () => {
    setRecipientLoading(true);
    if (values.createBy) {
      let response = await getApi("api/contact/view/", values.createBy);
      if (response?.status === 200) {
        setFieldValue("recipient", response?.data?.contact?.phoneNumber);
        values.recipient = response?.data?.contact?.phoneNumber;
      }
    } else if (values.createByLead) {
      let response = await getApi("api/lead/view/", values.createByLead);
      if (response?.status === 200) {
        setFieldValue("recipient", response?.data?.lead?.leadPhoneNumber);
        values.recipient = response?.data?.lead?.leadPhoneNumber;
      }
    }

    setRecipientLoading(false);
  };

  useEffect(() => {
    fetchRecipientData();
  }, [values.createBy, values.createByLead]);

  useEffect(() => {
    if (values?.category === "Lead") {
      const phoneNumber = values?.recipient;
      if (phoneNumber) {
        const duplicateLeads = assignmentToData?.filter(
          (lead) => lead?.leadPhoneNumber === phoneNumber
        );

        setDuplicateLeads(duplicateLeads);
      }
    }
  }, [values?.recipient]);

  return (
    <Modal size="2xl" onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Call </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {/* Contact Model  */}
          <ContactModel
            isOpen={contactModelOpen}
            onClose={setContactModel}
            fieldName="createBy"
            setFieldValue={setFieldValue}
          />
          {/* Lead Model  */}
          <LeadModel
            isOpen={leadModelOpen}
            onClose={setLeadModel}
            fieldName="createByLead"
            setFieldValue={setFieldValue}
          />

          <Grid templateColumns="repeat(12, 1fr)" gap={3}>
            <GridItem colSpan={{ base: 12, md: 6 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Related
              </FormLabel>
              <RadioGroup
                onChange={(e) => {
                  setFieldValue("category", e);
                  setFieldValue("createBy", "");
                  setFieldValue("createByLead", "");
                }}
                value={values.category}
              >
                <Stack direction="row">
                  <Radio value="Contact">Contact</Radio>
                  <Radio value="Lead">Lead</Radio>
                </Stack>
              </RadioGroup>
              <Text mb="10px" color={"red"}>
                {" "}
                {errors.category && touched.category && errors.category}
              </Text>
            </GridItem>
            <GridItem colSpan={{ base: 12 }}>
              {loading ? (
                <Progress width={200} size="xs" isIndeterminate />
              ) : (
                [
                  values.category === "Contact" ? (
                    <>
                      <GridItem colSpan={{ base: 12, md: 6 }}>
                        <FormLabel
                          display="flex"
                          ms="4px"
                          fontSize="sm"
                          fontWeight="500"
                          mb="8px"
                        >
                          Recipient (Contact)
                        </FormLabel>
                        <Flex justifyContent={"space-between"}>
                          <Select
                            value={values.createBy}
                            name="createBy"
                            onChange={handleChange}
                            disabled={loading}
                            mb={
                              errors.createBy && touched.createBy
                                ? undefined
                                : "10px"
                            }
                            fontWeight="500"
                            placeholder={"Assignment To"}
                            borderColor={
                              errors.createBy && touched.createBy
                                ? "red.300"
                                : null
                            }
                          >
                            {assignmentToData?.map((item) => {
                              return (
                                <option value={item._id} key={item._id}>
                                  {values.category === "Contact"
                                    ? `${item.firstName} ${item.lastName}`
                                    : item.leadName}
                                </option>
                              );
                            })}
                          </Select>
                          <IconButton
                            onClick={() => setContactModel(true)}
                            ml={2}
                            fontSize="25px"
                            icon={<LiaMousePointerSolid />}
                          />
                        </Flex>
                        <Text mb="10px" color={"red"}>
                          {" "}
                          {errors.createBy &&
                            touched.createBy &&
                            errors.createBy}
                        </Text>
                      </GridItem>
                    </>
                  ) : values.category === "Lead" ? (
                    <>
                      <GridItem colSpan={{ base: 12, md: 6 }}>
                        <FormLabel
                          display="flex"
                          ms="4px"
                          fontSize="sm"
                          fontWeight="500"
                          mb="8px"
                        >
                          Recipient (Lead)
                        </FormLabel>
                        <Flex justifyContent={"space-between"}>
                          <Select
                            disabled={loading}
                            value={values.createByLead}
                            name="createByLead"
                            onChange={handleChange}
                            mb={
                              errors.createByLead && touched.createByLead
                                ? undefined
                                : "10px"
                            }
                            fontWeight="500"
                            placeholder={"Assignment To"}
                            borderColor={
                              errors.createByLead && touched.createByLead
                                ? "red.300"
                                : null
                            }
                          >
                            {assignmentToData?.map((item) => {
                              return (
                                <option value={item._id} key={item._id}>
                                  {values.category === "Contact"
                                    ? `${item.firstName} ${item.lastName}`
                                    : item.leadName}
                                </option>
                              );
                            })}
                          </Select>
                          <IconButton
                            onClick={() => setLeadModel(true)}
                            ml={2}
                            fontSize="25px"
                            icon={<LiaMousePointerSolid />}
                          />
                        </Flex>
                        <Text mb="10px" color={"red"}>
                          {" "}
                          {errors.createByLead &&
                            touched.createByLead &&
                            errors.createByLead}
                        </Text>
                      </GridItem>
                    </>
                  ) : (
                    ""
                  ),
                ]
              )}
            </GridItem>
            <GridItem colSpan={{ base: 12 }}>
              {recipientLoading ? (
                <Progress width={200} size="xs" isIndeterminate />
              ) : (
                <div>
                  <FormLabel
                    display="flex"
                    ms="4px"
                    fontSize="sm"
                    fontWeight="500"
                    mb="8px"
                  >
                    Recipient<Text color={"red"}>*</Text>
                  </FormLabel>
                  <Input
                    fontSize="sm"
                    disabled
                    value={values.recipient}
                    name="recipient"
                    placeholder="Recipient"
                    fontWeight="500"
                    borderColor={
                      errors.recipient && touched.recipient ? "red.300" : null
                    }
                  />
                </div>
              )}
            </GridItem>
            {duplicateLeads?.length ? (
              <GridItem colSpan={{ base: 12 }}>
                <p>
                  There are <strong>{duplicateLeads?.length}</strong> number of
                  leads with the same phoneNumber.
                </p>

                <span>
                  {duplicateLeads?.map((lead) => {
                    const agent =
                      tree &&
                      tree["managers"] &&
                      tree["agents"]["manager-" + user?._id?.toString()]?.find(
                        (agent) =>
                          agent?._id?.toString() === lead?.agentAssigned
                      );
                    return (
                      <span>{agent?.firstName + " " + agent?.lastName}, </span>
                    );
                  })}
                </span>
              </GridItem>
            ) : (
              <></>
            )}
            <GridItem colSpan={{ base: 12, md: 6 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Start Date
              </FormLabel>
              <Input
                type="datetime-local"
                fontSize="sm"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.startDate}
                name="startDate"
                fontWeight="500"
                borderColor={
                  errors?.startDate && touched?.startDate ? "red.300" : null
                }
              />
              <Text mb="10px" color={"red"}>
                {" "}
                {errors.startDate && touched.startDate && errors.startDate}
              </Text>
            </GridItem>
            <GridItem colSpan={{ base: 12, md: 6 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                End Date
              </FormLabel>
              <Input
                type="datetime-local"
                fontSize="sm"
                min={values.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.endDate}
                name="endDate"
                fontWeight="500"
                borderColor={
                  errors?.endDate && touched?.endDate ? "red.300" : null
                }
              />
              <Text mb="10px" color={"red"}>
                {" "}
                {errors.endDate && touched.endDate && errors.endDate}
              </Text>
            </GridItem>
            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Call Duration<Text color={"red"}>*</Text>
              </FormLabel>
              <Input
                fontSize="sm"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.callDuration}
                name="callDuration"
                placeholder="call Duration"
                fontWeight="500"
                borderColor={
                  errors.callDuration && touched.callDuration ? "red.300" : null
                }
              />
              <Text mb="10px" color={"red"}>
                {" "}
                {errors.callDuration &&
                  touched.callDuration &&
                  errors.callDuration}
              </Text>
            </GridItem>
            <GridItem colSpan={{ base: 12 }}>
              <FormLabel
                display="flex"
                ms="4px"
                fontSize="sm"
                fontWeight="500"
                mb="8px"
              >
                Call Notes
              </FormLabel>
              <Textarea
                resize={"none"}
                fontSize="sm"
                placeholder="Enter Call Notes"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.callNotes}
                name="callNotes"
                fontWeight="500"
                borderColor={
                  errors.callNotes && touched.callNotes ? "red.300" : null
                }
              />
              <Text mb="10px" color={"red"}>
                {" "}
                {errors.callNotes && touched.callNotes && errors.callNotes}
              </Text>
            </GridItem>
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="brand"
            size="sm"
            disabled={isLoding ? true : false}
            onClick={handleSubmit}
          >
            {isLoding ? <Spinner /> : "Save"}
          </Button>
          <Button
            size="sm"
            sx={{
              marginLeft: 2,
              textTransform: "capitalize",
            }}
            variant="outline"
            colorScheme="red"
            onClick={() => {
              formik.resetForm();
              onClose();
            }}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddPhoneCall;
