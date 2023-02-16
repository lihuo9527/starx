import { sentenceCase } from 'change-case';
import { useState, useEffect, React } from 'react';
import { debounce } from 'lodash';
// @mui
import { useTheme } from '@mui/material/styles';
import {
    Stack, Card, Table, TableRow, Checkbox, TableBody, TableCell,
    Container, Typography, TableContainer, TablePagination, Dialog,
    DialogTitle, DialogContent, DialogContentText, Button, DialogActions,
    InputAdornment, Box, MenuItem, Divider, Radio, RadioGroup, FormControlLabel,
    Tab, Tabs, Avatar, IconButton,ImageListItem
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import SendIcon from '@mui/icons-material/Send';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

// components
import Iconify from '../../components/Iconify';
import InputStyle from '../../components/InputStyle';
// redux
import { useDispatch } from '../../redux/store';
// utils
import { fDateTime } from '../../utils/formatTime';
// hooks
import useSettings from '../../hooks/useSettings';

// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { ProductListHead } from '../../sections/@dashboard/e-commerce/product-list';
import { setGlobalMessage } from '../../redux/slices/global';
// import AddUserDialog from './components/userEdit';
import * as api from '../../services/api-client';
import Loading from '../../components/loading';

const TABLE_HEAD = [
    { id: 'id', label: 'ID', alignCenter: true },
    { id: 'applyNo', label: '预约单号', alignCenter: true },
    { id: 'trackingNumber', label: '运单号[收]', alignCenter: true },
    { id: 'expressCompanyEnum', label: '快递公司', alignCenter: true },
    { id: 'partNumber', label: '预约货号', alignCenter: true },
    { id: 'size', label: '尺码', alignCenter: true },
    { id: 'num', label: '数量', alignCenter: true },
    { id: 'name', label: '用户名', alignCenter: true },
    { id: 'identificationCode', label: '识别码', alignCenter: true },
    { id: 'ticketState', label: '工单状态', alignCenter: true },
    { id: 'createTime', label: '工单日期', alignCenter: true },
    { id: '', label: '操作', alignCenter: true },
];
let timer = null;

export default function WorkOrder() {
    const { themeStretch } = useSettings();
    const theme = useTheme();
    const dispatch = useDispatch();

    const [workOrderList, setWorkOrderList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [filterValue, setFilterValue] = useState({
        "applyNo": "",
        "expressCompanyEnum": '',
        "partNumber": "",
        "ticketType": "1",
        "trackingNumber": ""
    });
    const [visible, setVisible] = useState(false);
    const [total, setTotal] = useState(0);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMessageLoading, setIsMessageLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [isSubmitButtonLoading, setIsSubmitButtonLoading] = useState(false);
    const [detailDialogVisible, setDetailDialogVisible] = useState(false);
    const [selectedRow, setSelectedRow] = useState({
        "ticketId": '',
        "ticketState": "CREATE",
        "userId": ''
    });
    const [currentTicketState, setCurrentTicketState] = useState('');
    const [details, setDetails] = useState({});
    const [ticketType, setTicketType] = useState('1');
    const [sendValue, setSendValue] = useState('');
    const [currentImage, setCurrentImage] = useState('');
    const [isImageVisible, setImageVisible] = useState(false);
    const [imageFile, setImageFile] = useState('');
    const [isReviewImage, setIsReviewImage] = useState(false);
    const [isFilterValueChange, setIsFilterValueChange] = useState(false);
    const [fileValue, setFileValue] = useState('');
    useEffect(() => {
        getList();
    }, [rowsPerPage, ticketType, isFilterValueChange]);
    useEffect(() => {
        setFileValue('');
    }, [isImageVisible]);
    const handleChange = (event, newValue) => {
        setTicketType(newValue);
        setFilterValue({ ...filterValue, ticketType: newValue });
    };

    const getList = async (pageValue = 1) => {
        setIsLoading(true)
        try {
            const params = {
                ...filterValue,
            };
            const { page } = await api.fetchWorkOrderList(params, pageValue, rowsPerPage);
            setTotal(page.totalCount);
            setWorkOrderList(page.list);
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false)
    };

    // 搜索条件设置
    const handleFilter = (key, value) => {
        setFilterValue({ ...filterValue, [key]: value });
    };

    // 点击搜索按钮触发事件
    const onSearch = () => {
        setPage(0);
        getList();
    };

    // 点击重置按钮触发事件
    const onReset = () => {
        setFilterValue({
            "applyNo": "",
            "expressCompanyEnum": '',
            "partNumber": "",
            "ticketType": "",
            "trackingNumber": ""
        });
        setPage(0);
        setIsFilterValueChange(!isFilterValueChange);
    };

    // 每页显示条数切换
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };


    // 打开状态变更弹窗
    const onStateChange = (row = {}) => {
        setSelectedRow({
            "ticketId": row.id,
            "ticketState": row.ticketState,
            "userId": row.userId
        });
        setCurrentTicketState(row.ticketState);
        setDialogVisible(true);
    };

    // 关闭状态变更弹窗
    const onStateChangeDialogClose = () => {
        setSelectedRow(
            {
                "ticketId": '',
                "ticketState": "CREATE",
                "userId": ''
            }
        )
        setDialogVisible(false);
    }


    // 打开工单详情弹窗
    const onDetail = (row = {}) => {
        setDetails({});
        fetchWorkOrderDetails(row, 'true');
        setDetailDialogVisible(true);
    };

    const fetchWorkOrderDetails = async (row, handle = '') => {
        setIsMessageLoading(true);
        try {
            const result = await api.fetchWorkOrderDetails(row);
            const length = document.getElementById('scrollbarBottom').children.length;
            if (result.details.ticketDetailsCommentList.length !== length && result.details.ticketDetailsCommentList.length !== 0) {
                setDetails({ ...result.details, id: row.id, userId: row.userId });
                setTimeout(()=>{
                    const ref = document.getElementById('scrollbarBottom').parentNode.parentNode;
                    ref.scrollTop = ref.scrollHeight;
                }, 300);
                
            }
        } catch (e) {
            console.log(e);
        }
        setTimeout(()=>{
            setIsMessageLoading(false);
        }, 300);
        if (handle) {
            timer = setTimeout(() => fetchWorkOrderDetails(row, 'true'), 15000);
        }
    }

    const onDetailDialogClose = () => {
        clearTimeout(timer);
        setDetailDialogVisible(false);
    }

    const tickerStateChange = async () => {
        setIsButtonLoading(true);
        let result = {};
        try {
            result = await api.workOrderStateChange(selectedRow);
            if (result.msg === 'success') {
                getList();
                dispatch(
                    setGlobalMessage({
                        variant: 'success',
                        msg: '变更成功！',
                    })
                );
                setDialogVisible(false);
                setIsButtonLoading(false);
                return;
            }
        } catch (e) {
            console.log(e);
        }
        dispatch(
            setGlobalMessage({
                variant: 'error',
                msg: result.msg || '变更失败！',
            })
        );
        setIsButtonLoading(false);
    }

    const onSend = async (url = '') => {
        setIsButtonLoading(true);
        let result = {};
        try {
            result = await api.workOrderSendMessage({ content: sendValue, ticketId: details.id, pictureUrl: url });
            if (result.msg === 'success') {
                fetchWorkOrderDetails(details);
                dispatch(
                    setGlobalMessage({
                        variant: 'success',
                        msg: '发送成功！',
                    })
                );
                setSendValue('');
                setIsButtonLoading(false);
                return;
            }
        } catch (e) {
            console.log(e);
        }
        dispatch(
            setGlobalMessage({
                variant: 'error',
                msg: result.msg || '发送失败！',
            })
        );
        setIsButtonLoading(false);
    }

    const onFileChange = (file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.target.files[0]);
        setImageFile(file.target.files[0]);
        reader.onloadend = (e) => {
            const base64String = e.target.result;
            setCurrentImage(base64String);
            setImageVisible(true);
            setIsReviewImage(true);
            // onSend('image', base64String);
        };
    }

    const enlargeImage = (content) => {
        setCurrentImage(content);
        setIsReviewImage(false);
        setImageVisible(true);
    }

    const trySend = async () => {
        setIsSubmitButtonLoading(true);
        console.log(imageFile)
        const formData = new FormData();
        formData.append('file', imageFile);
        try {
            const { msg, url } = await api.uploadFile(formData);
            if (msg === 'success') {
                onSend(url);
                setIsSubmitButtonLoading(false);
                setImageVisible(false);
            }
        } catch (e) {
            console.log(e)
        }
        setIsSubmitButtonLoading(false);
    }

    const onImageVisibleClose = () => {
        setImageVisible(false);
        setIsReviewImage(false);
    }
    const handleKeyDown = (value) => {
        console.log(value)
    }
    return (
        <Page title="我的工单">
            <Container maxWidth={themeStretch ? false : 'lg'} sx={{ position: 'relative' }}>
                <HeaderBreadcrumbs
                    heading="工单信息"
                    links={[
                        { name: '工单信息' },
                        { name: '我的工单' },
                    ]}
                />
                <Card>
                    <Stack>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={ticketType} onChange={handleChange} sx={{ marginLeft: '10px' }}>
                                <Tab value={'1'} label="入库" />
                                <Tab value={'2'} label="出库" />
                                <Tab value={'3'} label="账单" />
                                <Tab value={'4'} label="其他" />
                            </Tabs>
                        </Box>
                    </Stack >
                    <Stack>
                        <Stack spacing={2} sx={{ py: 2.5, px: 3, display: 'flex', flexFlow: 'wrap', alignItems: 'center', justifyContent: 'flex-start', maxWidth: '100%' }}>
                            <InputStyle
                                label='预约单号'
                                size='small'
                                stretchStart={240}
                                value={filterValue.applyNo}
                                sx={{ marginTop: '16px', marginRight: '15px !important' }}
                                onChange={(event) => handleFilter('applyNo', event.target.value)}
                                placeholder="请输入预约单号"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                            <InputStyle
                                size='small'
                                label='运单号'
                                stretchStart={240}
                                value={filterValue.expressCompanyEnum}
                                sx={{ marginRight: '15px !important' }}
                                onChange={(event) => handleFilter('expressCompanyEnum', event.target.value)}
                                placeholder="请输入运单号"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                            <InputStyle
                                size='small'
                                label='快递公司'
                                stretchStart={240}
                                value={filterValue.identificationCode}
                                sx={{ marginRight: '15px !important' }}
                                onChange={(event) => handleFilter('identificationCode', event.target.value)}
                                placeholder="请输入快递公司"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                            <InputStyle
                                size='small'
                                label='货号'
                                stretchStart={240}
                                value={filterValue.partNumber}
                                sx={{ marginRight: '15px !important' }}
                                onChange={(event) => handleFilter('partNumber', event.target.value)}
                                placeholder="请输入货号"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                            <Button onClick={debounce(onSearch, 300)} sx={{ width: 104, maxHeight: 40, marginRight: '15px !important' }} variant="outlined">
                                查询
                            </Button>

                            <Button onClick={debounce(onReset, 300)} sx={{ maxHeight: 40 }} variant="outlined">
                                重置
                            </Button>

                        </Stack>
                    </Stack >
                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 1800 }}>
                            <Table>
                                <ProductListHead
                                    needCheckBox='false'
                                    headLabel={TABLE_HEAD}
                                    rowCount={workOrderList.length}
                                    numSelected={selected.length}
                                />

                                <TableBody sx={{ px: 2 }}>
                                    {workOrderList.map((row) => {
                                        return (
                                            <TableRow
                                                hover
                                                key={row.id}
                                                tabIndex={-1}

                                            >

                                                <TableCell align="center" style={{ minWidth: 100 }}>{row.id}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.applyNo}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.trackingNumber}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.expressCompanyEnum}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.partNumber}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.size}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.num}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.name}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.identificationCode}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 160 }}>
                                                    {row.ticketState === 'ING' &&
                                                        <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                            color={'info'}
                                                        >
                                                            跟进中
                                                        </Label>
                                                    }
                                                    {row.ticketState === 'CREATE' &&
                                                        <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                            color={'warning'}
                                                        >
                                                            已创建
                                                        </Label>
                                                    }
                                                    {row.ticketState === 'DONE' &&
                                                        <Label
                                                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                            color={'success'}
                                                        >
                                                            已完结
                                                        </Label>
                                                    }
                                                </TableCell>
                                                <TableCell align="center" style={{ minWidth: 150 }}>{fDateTime(row.createTime)}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }} >
                                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                                                        <Typography onClick={() => onDetail(row)} color={theme.palette.info.main} variant="body1" style={{ cursor: 'pointer' }}>
                                                            详情
                                                        </Typography>
                                                        <Typography onClick={() => onStateChange(row)} color={theme.palette.info.main} variant="body1" style={{ cursor: 'pointer' }}>
                                                            状态变更
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                {total === 0 && isLoading === false && (
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" colSpan={12}>
                                                <Box sx={{ py: 3 }}>
                                                    暂无数据
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                )}
                            </Table>
                        </TableContainer>
                    </Scrollbar>
                    {total > 0 && <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={total}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, value) => {
                            setPage(value);
                            getList(value + 1);
                        }}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                    }

                </Card >
                {/* 状态变更 */}
                <Dialog sx={{ mx: 'auto' }} scroll="paper" maxWidth={'800px'} open={dialogVisible}>
                    <DialogTitle id="scroll-dialog-title">
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                            <Typography variant="h6"> 状态变更 </Typography>
                            <Iconify onClick={onStateChangeDialogClose} icon={'eva:close-fill'} color={theme.palette.grey[800]} />
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, width: '600px' }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <Box sx={{ width: '100%' }}>
                                <span style={{ color: '#637381', fontSize: '14px', paddingLeft: '10px' }}>当前状态：</span>
                                <span>
                                    {currentTicketState === 'ING' &&
                                        <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                            color={'info'}
                                        >
                                            跟进中
                                        </Label>
                                    }
                                    {currentTicketState === 'CREATE' &&
                                        <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                            color={'warning'}
                                        >
                                            已创建
                                        </Label>
                                    }
                                    {currentTicketState === 'DONE' &&
                                        <Label
                                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                            color={'success'}
                                        >
                                            已完结
                                        </Label>
                                    }
                                </span>
                            </Box>
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3, width: '100%' }}
                        >
                            <InputStyle
                                label="工单状态"
                                select
                                style={{ width: '100%', marginLeft: 10 }}
                                placeholder="请选择状态"
                                value={selectedRow.ticketState}
                                onChange={(e) => setSelectedRow({ ...selectedRow, ticketState: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            >   <MenuItem value='CREATE'>已创建</MenuItem>
                                <MenuItem value='ING'>跟进中</MenuItem>
                                <MenuItem value='DONE'>已完结</MenuItem>

                            </InputStyle>
                        </Stack>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={onStateChangeDialogClose} variant="outlined">
                            取消
                        </Button>
                        <LoadingButton
                            onClick={tickerStateChange}
                            loading={isButtonLoading}
                            variant="contained"

                        >确认</LoadingButton>
                    </DialogActions>
                </Dialog>

                {/* 工单详情 */}
                {detailDialogVisible && <Dialog sx={{ mx: 'auto' }} scroll="paper" maxWidth={'1160x'} open={detailDialogVisible}>
                    <DialogTitle id="scroll-dialog-title">
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                            <Typography variant="h6"> 工单详情 </Typography>
                            <Iconify onClick={onDetailDialogClose} icon={'eva:close-fill'} color={theme.palette.grey[800]} />
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, width: '1160px', height: '720px', display: 'flex', flexWrap: 'nowrap', flexDirection: 'row' }}>
                        {/* {左边框} */}
                        <Box sx={{ p: 0, width: '840px', height: '100%', borderRight: '1px #eee solid' }}>
                            <Box sx={{ p: 0, width: '100%', height: '658px', position: 'relative' }}>
                                {/* 消息列表 */}
                                <Scrollbar>
                                    <Box sx={{ padding: 0, margin: 0 }} id="scrollbarBottom">
                                        {details.ticketDetailsCommentList?.map((row, index) =>
                                        (
                                            <Box sx={{ padding: 0, margin: 0 }} key={index}>
                                                {
                                                    row.isAdmin === 0 && <Stack sx={{ pb: 0, px: 2, display: 'flex', flexWrap: 'nowrap', flexDirection: 'row' }}>
                                                        <Box sx={{ width: '50px' }}>
                                                            <Avatar sx={{ width: '32px', height: '32px' }} />
                                                        </Box>
                                                        <Box sx={{ width: '100%' }}>
                                                            <Stack sx={{ pb: 0 }}>
                                                                <span style={{ fontSize: '12px' }}>{row.name} {fDateTime(row.createTime)}</span>
                                                            </Stack>
                                                            <Stack sx={{ pb: 3 }}>
                                                                <Box sx={{ marginTop: '16px', width: '100%', display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start' }}>
                                                                    {row.pictureUrl && <Stack sx={{ pb: 0, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                                                                        <div role="button" onKeyDown={handleKeyDown} tabIndex="0" style={{ maxWidth: '50%' }} onClick={()=>enlargeImage(row.pictureUrl)}>
                                                                            <img alt='' style={{ maxWidth: '100%' }} src={row.pictureUrl} />
                                                                        </div>
                                                                    </Stack>

                                                                    }
                                                                    {row.content && <Stack sx={{ pb: 0, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                                                                        <span style={{ fontSize: '14px', maxWidth: '50%', wordBreak: 'break-all', padding: '10px 16px', borderRadius: '5px', color: '#212B36', backgroundColor: '#F4F6F8' }}>{row.content}</span>
                                                                    </Stack>}
                                                                </Box>
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                }
                                                {
                                                    row.isAdmin === 1 &&
                                                    <Stack sx={{ pb: 0, px: 2, display: 'flex', flexWrap: 'nowrap', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                        <Box sx={{ width: '100%' }}>
                                                            <Stack sx={{ pb: 0, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                                <span style={{ fontSize: '12px' }}>{row.name} {fDateTime(row.createTime)}</span>
                                                            </Stack>
                                                            <Stack sx={{ pb: 3 }}>
                                                                <Box sx={{ marginTop: '16px', width: '100%', display: 'flex', flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                                    {row.pictureUrl && <Stack sx={{ pb: 0, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                                        <div role="button" onKeyDown={handleKeyDown} tabIndex="0" style={{ maxWidth: '50%' }} onClick={()=>enlargeImage(row.pictureUrl)}>
                                                                            <img alt='' style={{ maxWidth: '100%' }} src={row.pictureUrl} />
                                                                        </div>
                                                                    </Stack>

                                                                    }
                                                                    {row.content && <Stack sx={{ pb: 0, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                                                        <span style={{ fontSize: '14px', maxWidth: '50%', wordBreak: 'break-all', padding: '10px 16px', borderRadius: '5px', color: '#212B36', backgroundColor: '#C8FACD' }}>{row.content}</span>
                                                                    </Stack>}
                                                                </Box>
                                                            </Stack>
                                                        </Box>
                                                        <Box sx={{ width: '50px', display: 'flex', justifyContent: 'flex-end' }}>
                                                            <Avatar sx={{ width: '32px', height: '32px' }} />
                                                        </Box>
                                                    </Stack>
                                                }

                                            </Box>
                                        )
                                        )}

                                    </Box>
                                </Scrollbar>
                                {isMessageLoading && <Loading />}
                            </Box>
                            {/* 消息发送 */}
                            <Divider />
                            <Stack sx={{ p: 0, display: 'flex', justifyContent: 'flex-start', width: '100%', height: '60px', alignItems: 'center', flexDirection: 'row' }}>
                                <label htmlFor="icon-button-file">
                                    <input onChange={onFileChange} accept="image/*,.jpeg" value={fileValue} id="icon-button-file" type="file" style={{ display: 'none' }} />
                                    <IconButton color="primary" aria-label="upload picture" component="span" sx={{ marginRight: '10px', marginLeft: '10px' }}>
                                        <PhotoCamera />
                                    </IconButton>
                                </label>
                                <InputStyle
                                    size='small'
                                    sx={{ width: '100%' }}
                                    value={sendValue}
                                    onChange={(event) => setSendValue(event.target.value)}
                                    placeholder="请输入内容"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" />
                                        ),
                                    }}
                                />
                                <LoadingButton loading={isButtonLoading} onClick={() => onSend()} variant="contained" sx={{ width: '100px', marginRight: '15px', marginLeft: '15px' }} endIcon={<SendIcon />}>
                                    发送
                                </LoadingButton>
                            </Stack>
                        </Box>
                        {/* {右边框} */}
                        <Box sx={{ p: 0, width: '320px', height: '100%' }}>
                            <Stack sx={{ pb: 3, display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'row', marginTop: '20px' }}>
                                <Avatar sx={{ width: '96px', height: '96px' }} src={details?.headPortrait} />
                            </Stack>
                            <Stack sx={{ pb: 0, display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'row', marginBottom: '40px' }}>
                                <Typography variant="h6"> {details?.name} </Typography>
                            </Stack>
                            <Divider />
                            <Stack sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', width: '100%', flexDirection: 'row' }}>
                                <span style={{ fontSize: '14px' }}>用户信息</span>
                                <Iconify icon={'eva:arrow-ios-downward-fill'} color={theme.palette.grey[800]} />
                            </Stack>
                            <Box>
                                <Stack sx={{ px: 2, display: 'flex', justifyContent: 'flex-start', width: '100%', flexDirection: 'row' }}>
                                    <span style={{ fontSize: '14px', color: '#919EAB', width: '80px', textAlign: 'right' }}>微信号：</span>
                                    <span style={{ fontSize: '14px' }}>{details?.weChat}</span>
                                </Stack>
                                <Stack sx={{ px: 2, display: 'flex', justifyContent: 'flex-start', width: '100%', flexDirection: 'row', marginTop: '10px' }}>
                                    <span style={{ fontSize: '14px', color: '#919EAB', width: '80px', textAlign: 'right' }}>识别码：</span>
                                    <span style={{ fontSize: '14px' }}>{details?.identificationCode}</span>
                                </Stack>
                                <Stack sx={{ px: 2, display: 'flex', justifyContent: 'flex-start', width: '100%', flexDirection: 'row', margin: '10px 0 20px 0' }}>
                                    <span style={{ fontSize: '14px', color: '#919EAB', width: '80px', textAlign: 'right' }}>会员等级：</span>
                                    <span style={{ fontSize: '14px' }}>{details?.memberLeave}</span>
                                </Stack>
                                <Divider />
                            </Box>
                            <Stack sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', width: '100%', flexDirection: 'row' }}>
                                <span style={{ fontSize: '14px' }}>工单信息</span>
                                <Iconify icon={'eva:arrow-ios-downward-fill'} color={theme.palette.grey[800]} />
                            </Stack>
                            <Box>
                                <Stack sx={{ px: 2, display: 'flex', justifyContent: 'flex-start', width: '100%', flexDirection: 'row' }}>
                                    <span style={{ fontSize: '14px', color: '#919EAB', width: '80px', textAlign: 'right' }}>当前状态：</span>
                                    <span style={{ fontSize: '14px' }}>
                                        {details?.ticketState === 'ING' &&
                                            <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                color={'info'}
                                            >
                                                跟进中
                                            </Label>
                                        }
                                        {details?.ticketState === 'CREATE' &&
                                            <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                color={'warning'}
                                            >
                                                已创建
                                            </Label>
                                        }
                                        {details?.ticketState === 'DONE' &&
                                            <Label
                                                variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                color={'success'}
                                            >
                                                已完结
                                            </Label>
                                        }
                                    </span>
                                </Stack>
                                <Stack sx={{ px: 2, display: 'flex', justifyContent: 'flex-start', width: '100%', flexDirection: 'row', marginTop: '10px' }}>
                                    <span style={{ fontSize: '14px', color: '#919EAB', width: '80px', textAlign: 'right' }}>工单类型：</span>
                                    <span style={{ fontSize: '14px' }}>
                                        {details?.ticketType === '1' && '入库'}
                                        {details?.ticketType === '2' && '出库'}
                                        {details?.ticketType === '3' && '账单'}
                                        {details?.ticketType === '4' && '其他'}
                                    </span>
                                </Stack>
                                <Stack sx={{ px: 2, display: 'flex', justifyContent: 'flex-start', width: '100%', flexDirection: 'row', marginTop: '10px' }}>
                                    <span style={{ fontSize: '14px', color: '#919EAB', width: '80px', textAlign: 'right' }}>预约单号：</span>
                                    <span style={{ fontSize: '14px' }}>{details?.applyNo}</span>
                                </Stack>
                                <Stack sx={{ px: 2, display: 'flex', justifyContent: 'flex-start', width: '100%', flexDirection: 'row', margin: '10px 0 20px 0' }}>
                                    <span style={{ fontSize: '14px', color: '#919EAB', width: '80px', textAlign: 'right' }}>问题包裹：</span>
                                    <span style={{ fontSize: '14px' }}>{details?.describe}</span>
                                </Stack>
                            </Box>
                        </Box>
                    </DialogContent>
                </Dialog>}
                {isImageVisible === true && <Dialog sx={{ mx: 'auto', }} scroll="paper" maxWidth={'1200x'} open={isImageVisible}>
                    <DialogTitle>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                            <Typography variant="h6"> &nbsp; </Typography>
                            <Iconify onClick={() => onImageVisibleClose()} icon={'eva:close-fill'} color={theme.palette.grey[800]} />
                        </Stack>
                    </DialogTitle>
                    <Stack sx={{ px: 2 }}>
                        <img alt="" src={currentImage} />
                    </Stack>
                    {isReviewImage && <Stack sx={{ px: 2, display: 'flex', justifyContent: 'flex-start', width: '100%', height: '60px', alignItems: 'center', flexDirection: 'row' }}>
                        <InputStyle
                            size='small'
                            sx={{ width: '100%' }}
                            value={sendValue}
                            onChange={(event) => setSendValue(event.target.value)}
                            placeholder="请输入内容"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <LoadingButton loading={isSubmitButtonLoading} onClick={() => trySend()} variant="contained" sx={{ width: '100px', marginLeft: '15px' }} endIcon={<SendIcon />}>
                            发送
                        </LoadingButton>
                    </Stack>}
                </Dialog>}

            </Container >
            {isLoading && <Loading />}
        </Page >
    );
}
