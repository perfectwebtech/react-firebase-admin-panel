import React from "react";
import LoadingOverlay from "react-loading-overlay";
import Select from "react-select";
import CopyToClipboard from 'react-copy-to-clipboard';
import NotificationAlert from "react-notification-alert";
import Firebase from "firebase";
import config from "../../../config";
import IconUpload from "../../../components/CustomUpload/IconUpload";

import {
    Col,
    Card,
    CardHeader,
    CardBody,
    CardTitle,
    Collapse,
    Row,
    Button,
    Form,
    FormGroup,
    Label,
    Input,
    Table,
    UncontrolledTooltip
} from "reactstrap";

class ServiceEdit extends React.Component {
    constructor(props) {
        super(props);
        if (!Firebase.apps.length) {
            Firebase.initializeApp(config);
        }

        this.state = {
            loading: false,
            icon_max_limit: 0,

            service_key: '',
            name: '',
            service_details: '',
            start_character: '',
            start_number: 1,
            invalid_start_number: false,
            end_number: 2,
            priority: 1,
            time_reset: 0,
            is_reset: false,
            nameState: 'has-success',

            new_week_select: {value: 0, label: 'Sunday'},
            new_start_time: '',
            new_end_time: '',
            service_days: [],

            openedCollapses: [],
            last_printed_number: '',
            last_printed_date_time: '',
            last_called_number: '',
            last_called_date_time: '',
            last_called_counter: '',
            last_called_user: '',
            current_status: '',
            last_generated_token: '0000',
            last_generated_token_date_time: '',
            daily_reset_date_time: ''
        };

        this.handleSave = this.handleSave.bind(this);
        this.handleAddDay = this.handleAddDay.bind(this);
    }
    componentWillMount() {
        var id = this.props.match.params.id;
        if (id !== "" && id !== null && id !== undefined) {
            this.setState({service_key: id});
            this.loadData(id);
        }
    }
    loadData() {
        let _this = this;
        _this.setState({loading: true});
        // ---------- Load Icon Max Size ---------- //
        Firebase.firestore().collection('System_Config').doc('Upload_Limits').get().then(function (upload_limit_info) {
            if (upload_limit_info.exists) {
                _this.setState({icon_max_limit: upload_limit_info.data().Max_Icon_size_in_MB});
                // ---------- Load Service Data ---------- //
                Firebase.firestore().collection('Services').doc(_this.state.service_key).get().then(function (doc) {
                    if (doc.exists) {
                        _this.setState({name: doc.data().Name});
                        _this.setState({service_details: doc.data().Details});
                        _this.setState({icon: doc.data().Icon});
                        _this.refs.icon.handleSetUrl(_this.state.icon);
                        _this.setState({start_character: doc.data().Start_Character});
                        _this.setState({start_number: doc.data().Start_Number});
                        _this.setState({end_number: doc.data().End_Number});
                        _this.setState({priority: doc.data().Priority});
                        _this.setState({time_reset: doc.data().Reset_Time});
                        _this.setState({is_reset: doc.data().Auto_Reset});
                        _this.setState({service_days: doc.data().Service_Days});
                        _this.setState({last_printed_number: doc.data().Last_Printed_Number});
                        _this.setState({last_printed_date_time: doc.data().Last_Printed_Date_Time});
                        _this.setState({last_called_number: doc.data().Last_Called_Number});
                        _this.setState({last_called_date_time: doc.data().Last_Called_Date_Time});
                        _this.setState({last_called_counter: doc.data().Last_Called_Counter});
                        _this.setState({last_called_user: doc.data().Last_Called_User});
                        _this.setState({current_status: doc.data().Current_Status});
                        _this.setState({last_generated_token: doc.data().Last_Generated_Token});
                        _this.setState({last_generated_token_date_time: doc.data().Last_Generated_Token_Date_Dime});
                        _this.setState({daily_reset_date_time: doc.data().Daily_Reset_Date_Time});
                        _this.setState({loading: false});
                    } else {
                        _this.setState({loading: false});
                        _this.notifyMessage("tc", 3, "Network error!");
                    }
                }).catch(function (err) {
                    _this.setState({loading: false});
                    _this.notifyMessage("tc", 3, "Network error!");
                });
            } else {
                _this.setState({loading: false});
                _this.notifyMessage("tc", 3, "Network error!");
            }
        }).catch(function (err) {
            _this.setState({loading: false});
            _this.notifyMessage("tc", 3, "Network error!");
        });
    }
    handleSave() {
        if (this.state.nameState === "") {
            this.setState({ nameState: "has-danger" });
        }

        if (this.state.nameState === "has-success" && !this.state.invalid_start_number) {
            let _this = this;
            _this.setState({loading: true});
            var now = new Date();
            let file = this.refs.icon.state.file;
            if (file !== null) {
                // --------- Check Max Icon Size Limit --------- //
                let max_bytes = _this.state.icon_max_limit * 1024 * 1024;
                if (file.size > max_bytes) {
                    _this.setState({loading: false});
                    _this.notifyMessage("tc", 3, "Icon file size exceeds maximum size.");
                } else {
                    var storageRef = Firebase.storage().ref();
                    var image_name = "service_icon_" + this.state.service_key;
                    var mainLocationRef = storageRef.child(image_name);
                    mainLocationRef.put(file).then(function (snapshot) {
                        mainLocationRef.getDownloadURL().then(function (res) {
                            let update_service_data = {
                                Created_Date: now,
                                Icon: res,
                                Name: _this.state.name,
                                Details: _this.state.service_details,
                                Start_Character: _this.state.start_character,
                                Start_Number: parseInt(_this.state.start_number),
                                End_Number: parseInt(_this.state.end_number),
                                Priority: parseInt(_this.state.priority),
                                Reset_Time: parseInt(_this.state.time_reset),
                                Auto_Reset: _this.state.is_reset,
                                Service_Days: _this.state.service_days,
                                Updated_Date: now,
                                Last_Printed_Number: _this.state.last_printed_number,
                                Last_Printed_Date_Time: _this.state.last_printed_date_time,
                                Last_Called_Number : _this.state.last_called_number,
                                Last_Called_Date_Time: _this.state.last_called_date_time,
                                Last_Called_Counter: _this.state.last_called_counter,
                                Last_Called_User: _this.state.last_called_user,
                                Current_Status: _this.state.current_status,
                                Last_Generated_Token: _this.state.last_generated_token,
                                Last_Generated_Token_Date_Dime: _this.state.last_generated_token_date_time,
                                Daily_Reset_Date_Time: _this.state.daily_reset_date_time
                            };

                            Firebase.firestore().collection('Services').doc(_this.state.service_key).update(update_service_data)
                                .then(function() {
                                    _this.setState({loading: false});
                                    _this.notifyMessage("tc", 2, "Save Service Success!");
                                    window.setTimeout(function() { _this.props.history.push("/services") }, 2000);
                                }).catch(function (error) {
                                _this.setState({loading: false});
                                _this.notifyMessage("tc", 3, "Network error!");
                            });
                        }).catch(function (err) {
                            _this.setState({loading: false});
                            _this.notifyMessage("tc", 3, "Network error!");
                        });
                    }).catch(function (err) {
                        _this.setState({loading: false});
                        _this.notifyMessage("tc", 3, "Network error!");
                    });
                }
            } else {
                let update_service_data = {
                    Created_Date: now,
                    Name: _this.state.name,
                    Details: _this.state.service_details,
                    Start_Character: _this.state.start_character,
                    Start_Number: parseInt(_this.state.start_number),
                    End_Number: parseInt(_this.state.end_number),
                    Priority: parseInt(_this.state.priority),
                    Reset_Time: parseInt(_this.state.time_reset),
                    Auto_Reset: _this.state.is_reset,
                    Service_Days: _this.state.service_days,
                    Updated_Date: now,
                    Last_Printed_Number: _this.state.last_printed_number,
                    Last_Printed_Date_Time: _this.state.last_printed_date_time,
                    Last_Called_Number : _this.state.last_called_number,
                    Last_Called_Date_Time: _this.state.last_called_date_time,
                    Last_Called_Counter: _this.state.last_called_counter,
                    Last_Called_User: _this.state.last_called_user,
                    Current_Status: _this.state.current_status,
                    Last_Generated_Token: _this.state.last_generated_token,
                    Last_Generated_Token_Date_Dime: _this.state.last_generated_token_date_time,
                    Daily_Reset_Date_Time: _this.state.daily_reset_date_time
                };

                Firebase.firestore().collection('Services').doc(_this.state.service_key).update(update_service_data)
                    .then(function() {
                        _this.setState({loading: false});
                        _this.notifyMessage("tc", 2, "Save Service Success!");
                        window.setTimeout(function() { _this.props.history.push("/services") }, 2000);
                    }).catch(function (error) {
                    _this.setState({loading: false});
                    _this.notifyMessage("tc", 3, "Network error!");
                });
            }
        }
    }
    handleAddDay() {
        let _this = this;
        if (this.state.new_start_time !== "" && this.state.new_end_time !== "") {
            let new_service_day = {
                week_day_order: this.state.new_week_select.value,
                week_day: this.state.new_week_select.label,
                start_time: this.state.new_start_time,
                end_time: this.state.new_end_time
            };

            if (new_service_day.start_time >= new_service_day.end_time) {
                this.notifyMessage("tc", 3, "Start time cannot same or bigger than the end time!");
                return;
            }

            let cur_service_days = this.state.service_days;
            let sames = cur_service_days.filter(item => item.week_day === new_service_day.week_day);
            let overlap = false;
            sames.forEach(function (one) {
                if ((new_service_day.start_time >= one.start_time && new_service_day.start_time <= one.end_time) || (new_service_day.end_time >= one.start_time && new_service_day.end_time <= one.end_time)) {
                    _this.notifyMessage("tc", 3, "Time Range Overlap!");
                    overlap = true;
                    return;
                }
            });

            if (overlap)
                return;

            cur_service_days.push(new_service_day);
            // ------------- Sort Date and Start Time ------------ //
            let sorted = cur_service_days.sort(function(a,b){
                if (a.week_day === b.week_day) {
                    let x = a.start_time < b.start_time? -1:1;
                    return x;
                } else {
                    let x = a.week_day_order < b.week_day_order? -1:1;
                    return x;
                }
            });
            this.setState({service_days: sorted});
            this.setState({new_start_time: ''});
            this.setState({new_end_time: ''});
        }
    }
    handleDeleteDay(index) {
        var cur_service_days = this.state.service_days;
        if (index !== -1) cur_service_days.splice(index, 1);
        this.setState({service_days: cur_service_days});
    }
    getServiceDays() {
        return this.state.service_days.map((prop, key) => {
            return (
                <tr key={key}>
                    <td>{prop.week_day}</td>
                    <td>{prop.start_time}</td>
                    <td>{prop.end_time}</td>
                    <td className="td-actions">
                        <Button
                            className="btn-neutral"
                            color="default"
                            data-placement="left"
                            id={"day" + key.toString()}
                            title=""
                            type="button"
                            onClick={e => {e.preventDefault(); this.handleDeleteDay(key);}}
                        >
                            <i className="nc-icon nc-simple-remove" />
                        </Button>
                        <UncontrolledTooltip
                            delay={0}
                            placement="left"
                            target={"day" + key.toString()}
                        >
                            Remove item
                        </UncontrolledTooltip>
                    </td>
                </tr>
            );
        });
    }
    notifyMessage = (place, color, text) => {
        var type;
        switch (color) {
            case 1:
                type = "primary";
                break;
            case 2:
                type = "success";
                break;
            case 3:
                type = "danger";
                break;
            case 4:
                type = "warning";
                break;
            case 5:
                type = "info";
                break;
            default:
                break;
        }

        var options = {};
        options = {
            place: place,
            message: (
                <div className="text-md-center">
                    <div>
                        <b>{text}</b>
                    </div>
                </div>
            ),
            type: type,
            icon: "now-ui-icons ui-1_bell-53",
            autoDismiss: 3
        };
        this.refs.notificationAlert.notificationAlert(options);
    };
    verifyLength = (value, length) => {
        return value.length >= length;
    };
    verifyNumber = value => {
        var numberRex = new RegExp("^[0-9]+$");
        if (numberRex.test(value)) {
            return true;
        }
        return false;
    };
    change = (event, stateName, type, stateNameEqualTo) => {
        switch (type) {
            case "length":
                if (this.verifyLength(event.target.value, stateNameEqualTo)) {
                    this.setState({ [stateName + "State"]: "has-success" });
                } else {
                    this.setState({ [stateName + "State"]: "has-danger" });
                }
                break;
            case "number":
                if (this.verifyNumber(event.target.value) && parseInt(event.target.value) > 0 && parseInt(event.target.value) < parseInt(this.state.end_number)) {
                    this.setState({invalid_start_number: false});
                    this.setState({ start_number: parseInt(event.target.value) });
                    var str = (parseInt(event.target.value) - 1).toString();
                    var pad = "0000";
                    var last_generated_token = pad.substring(0, pad.length - str.length) + str;
                    this.setState({ last_generated_token: last_generated_token });
                } else {
                    console.log('dd');
                    this.setState({invalid_start_number: true});
                    this.setState({ last_generated_token: "" });
                }
                break;
            default:
                break;
        }
        this.setState({ [stateName]: event.target.value });
    };
    collapsesToggle = collapse => {
        let openedCollapses = this.state.openedCollapses;
        if (openedCollapses.includes(collapse)) {
            this.setState({
                openedCollapses: openedCollapses.filter(item => item !== collapse)
            });
        } else {
            openedCollapses.push(collapse);
            this.setState({
                openedCollapses: openedCollapses
            });
        }
    };
    render() {
        let {
            nameState
        } = this.state;
        return (
            <>
                <LoadingOverlay
                    active={this.state.loading}
                    spinner
                    text='Loading'
                    className='content'
                >
                    <NotificationAlert ref="notificationAlert" />
                    <Row>
                        <Col md="12">
                            <Card>
                                <CardHeader>
                                    <CardTitle tag="h4">Service Edit</CardTitle>
                                </CardHeader>
                                <CardBody>
                                    <Col className="ml-auto mr-auto" lg="8">
                                        <Row>
                                            <Col md="3">
                                                <Button
                                                    color="success"
                                                    onClick={e => this.handleSave()}
                                                    block
                                                >
                                                    Save
                                                </Button>
                                            </Col>
                                            <Col md="3">
                                                <Button
                                                    color="youtube"
                                                    onClick={e => this.props.history.push("/services")}
                                                    block
                                                >
                                                    Close
                                                </Button>
                                            </Col>
                                        </Row>
                                        <Row className="top-margin-10">
                                        </Row>
                                        <Row>
                                            <Col md="8">
                                                <Form className="form-horizontal">
                                                    <Row>
                                                        <Label md="4">Service Key</Label>
                                                        <Col md="8">
                                                            <FormGroup>
                                                                <Row>
                                                                    <Col md="9">
                                                                        <Input
                                                                            value={this.state.service_key}
                                                                            disabled
                                                                        />
                                                                    </Col>
                                                                    <Col md="3">
                                                                        <CopyToClipboard
                                                                            text={this.state.service_key}
                                                                            onCopy={e => this.notifyMessage("tc", 2, "Copied to clipboard")}
                                                                        >
                                                                            <Button className="margin-0 btn btn-primary text-capitalize" block>Copy</Button>
                                                                        </CopyToClipboard>
                                                                    </Col>
                                                                </Row>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Label md="4">Service Name</Label>
                                                        <Col md="8">
                                                            <FormGroup className={`has-label ${nameState}`}>
                                                                <Input
                                                                    defaultValue={this.state.name}
                                                                    type="text"
                                                                    onChange={e =>
                                                                        this.change(e, "name", "length", 1)
                                                                    }
                                                                />
                                                                {this.state.nameState === "has-danger" ? (
                                                                    <label className="error">This field is required.</label>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Label md="4">Icon</Label>
                                                        <Col md="8">
                                                            <IconUpload ref="icon" />
                                                        </Col>
                                                    </Row>
                                                    <Row className="top-margin-10">
                                                        <Label md="4">Service Details</Label>
                                                        <Col md="8">
                                                            <FormGroup>
                                                                <Input
                                                                    value={this.state.service_details}
                                                                    type="textarea"
                                                                    onChange={e => {this.setState({service_details: e.target.value})}}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Label md="4">Start Character</Label>
                                                        <Col md="8">
                                                            <FormGroup>
                                                                <Input
                                                                    placeholder="Start Character"
                                                                    type="text"
                                                                    onChange={e => {this.setState({start_character: e.target.value})}}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Label md="4">Start Number</Label>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Input
                                                                    value={this.state.start_number}
                                                                    type="number"
                                                                    invalid={this.state.invalid_start_number}
                                                                    // min={1}
                                                                    // max={parseInt(this.state.end_number) - 1}
                                                                    onChange={e => {this.change(e, "start_number", "number")}}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Label md="4">End Number</Label>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Input
                                                                    value={this.state.end_number}
                                                                    type="number"
                                                                    // min={parseInt(this.state.start_number) + 1}
                                                                    onChange={e => {this.setState({end_number: e.target.value})}}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Label md="4">Priority</Label>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Input
                                                                    value={this.state.priority}
                                                                    type="number"
                                                                    min={1}
                                                                    onChange={e => {this.setState({priority: e.target.value})}}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Label md="4"/>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <div className="form-check-radio">
                                                                    <Label check>
                                                                        <Input
                                                                            checked={!this.state.is_reset}
                                                                            defaultValue="option1"
                                                                            id="exampleRadios11"
                                                                            name="exampleRadioz"
                                                                            type="radio"
                                                                            onChange={e => {this.setState({is_reset: !this.state.is_reset})}}
                                                                        />
                                                                        Radio Daily at Reset time <span className="form-check-sign" />
                                                                    </Label>
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="2">
                                                            <Input
                                                                disabled={this.state.is_reset}
                                                                value={this.state.time_reset}
                                                                type="number"
                                                                min={0}
                                                                max={23}
                                                                onChange={e => {this.setState({time_reset: e.target.value})}}
                                                            />
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Label md="4"/>
                                                        <Col md="8">
                                                            <FormGroup>
                                                                <div className="form-check-radio">
                                                                    <Label check>
                                                                        <Input
                                                                            checked={this.state.is_reset}
                                                                            defaultValue="option2"
                                                                            id="exampleRadios12"
                                                                            name="exampleRadioz"
                                                                            type="radio"
                                                                            onChange={e => {this.setState({is_reset: !this.state.is_reset})}}
                                                                        />
                                                                        Reset When Maximum number is reached <span className="form-check-sign" />
                                                                    </Label>
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md="4">
                                                            <FormGroup>
                                                                <Select
                                                                    className="react-select primary"
                                                                    classNamePrefix="react-select"
                                                                    name="weekSelect"
                                                                    value={this.state.new_week_select}
                                                                    onChange={value =>
                                                                        this.setState({ new_week_select: value })
                                                                    }
                                                                    options={[
                                                                        { value: 0, label: "Sunday" },
                                                                        { value: 1, label: "Monday" },
                                                                        { value: 2, label: "Tuesday" },
                                                                        { value: 3, label: "Wednesday" },
                                                                        { value: 4, label: "Thursday" },
                                                                        { value: 5, label: "Friday" },
                                                                        { value: 6, label: "Saturday" },
                                                                    ]}
                                                                    placeholder="Select day of the week"
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Input
                                                                    placeholder="Start Time"
                                                                    value={this.state.new_start_time}
                                                                    type="time"
                                                                    onChange={e => {this.setState({new_start_time: e.target.value})}}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="3">
                                                            <FormGroup>
                                                                <Input
                                                                    placeholder="End Time"
                                                                    value={this.state.new_end_time}
                                                                    type="time"
                                                                    onChange={e => {this.setState({new_end_time: e.target.value})}}
                                                                />
                                                            </FormGroup>
                                                        </Col>
                                                        <Col md="2">
                                                            <Button
                                                                className="top-margin-2"
                                                                color="success"
                                                                onClick={e => this.handleAddDay()}
                                                                block
                                                            >
                                                                Add
                                                            </Button>
                                                        </Col>
                                                        <Col md="12">
                                                            <FormGroup>
                                                                <Table bordered>
                                                                    <thead className="text-center back">
                                                                    <tr>
                                                                        <th>Day</th>
                                                                        <th>Start Time</th>
                                                                        <th>End Time</th>
                                                                        <th/>
                                                                    </tr>
                                                                    </thead>
                                                                    <tbody className="text-center">
                                                                    {this.getServiceDays()}
                                                                    </tbody>
                                                                </Table>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Card className="card-plain width-100">
                                                            <CardHeader role="tab">
                                                                <a
                                                                    aria-expanded={this.state.openedCollapses.includes(
                                                                        "show-more"
                                                                    )}
                                                                    href="#"
                                                                    data-parent="#accordion"
                                                                    data-toggle="collapse"
                                                                    onClick={e => {e.preventDefault(); this.collapsesToggle("show-more");}}
                                                                >
                                                                    Show More...{" "}
                                                                </a>
                                                            </CardHeader>
                                                            <Collapse
                                                                role="tabpanel"
                                                                isOpen={this.state.openedCollapses.includes(
                                                                    "show-more"
                                                                )}
                                                            >
                                                                <CardBody>
                                                                    <Row>
                                                                        <Label md="4">Last Printed Number</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.last_printed_number}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Label md="4">Last Printed Datetime</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.last_printed_date_time}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Label md="4">Sub Location Count</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.sub_location_cnt}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Label md="4">Last Called Number</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.last_called_number}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Label md="4">Last Called Datetime</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.last_called_date_time}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Label md="4">Last Called Counter</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.last_called_counter}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Label md="4">Last Called User</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.last_called_user}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Label md="4">Current Status</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.current_status}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Label md="4">Last Generated Token</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.last_generated_token}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Label md="4">Last Generated Token Datetime</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.last_generated_token_date_time}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                    <Row>
                                                                        <Label md="4">Daily Reset Datetime</Label>
                                                                        <Col md="8">
                                                                            <FormGroup>
                                                                                <Input
                                                                                    value={this.state.daily_reset_date_time}
                                                                                    type="text"
                                                                                    disabled
                                                                                />
                                                                            </FormGroup>
                                                                        </Col>
                                                                    </Row>
                                                                </CardBody>
                                                            </Collapse>
                                                        </Card>
                                                    </Row>
                                                </Form>
                                            </Col>
                                        </Row>
                                    </Col>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </LoadingOverlay>
            </>
        );
    }
}

export default ServiceEdit;
