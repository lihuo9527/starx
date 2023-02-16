import { sentenceCase } from 'change-case';
import { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import JsBarcode from 'jsbarcode';
import ReactToPrint from 'react-to-print';
// @mui
import { useTheme, styled } from '@mui/material/styles';

import {
    Stack, Card, Table, TableRow, Checkbox, TableBody, TableCell,
    Container, Typography, TableContainer, TablePagination, Dialog,
    DialogTitle, DialogContent, DialogContentText, Button, DialogActions,
    InputAdornment, Box, MenuItem, Divider, Radio, RadioGroup, FormControlLabel,
    TextField, TextFieldProps, Avatar
} from '@mui/material';
import { DatePicker } from '@mui/lab';

import LoadingButton from '@mui/lab/LoadingButton';
// components
import Iconify from '../../components/Iconify';
import InputStyle from '../../components/InputStyle';
// redux
import { useDispatch } from '../../redux/store';
// utils
import { fDateTime, formatDate } from '../../utils/formatTime';
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


const CssTextField = styled(TextField)({
    '& label': {
        color: '#919EAB !important',
    },
    '& .MuiInput-underline:after': {
        color: 'green !important',
        borderBottomColor: 'green',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            color: '#919EAB !important',
            borderColor: 'rgba(145, 158, 171, 0.32) !important',
        },
        '&:hover fieldset': {
            color: '#919EAB !important',
            borderColor: 'none !important',
        },
        '&.Mui-focused fieldset': {
            color: '#green !important',
            borderColor: '#00AB55 !important',
        },
    },
});

const TABLE_HEAD = [
    // { id: 'id', label: 'ID', alignCenter: true },
    { id: 'applyNo', label: '预约单号', alignCenter: true },
    { id: 'trackingNumber', label: '运单号[收]', alignCenter: true },
    { id: 'expressCompanyEnum', label: '快递公司', alignCenter: true },
    { id: 'logisticsStatusEnum', label: '派送状态', alignCenter: true },
    { id: 'img', label: '商品图片', alignCenter: true },
    { id: 'partNumber', label: '货号', alignCenter: true },
    { id: 'size', label: '尺寸', alignCenter: true },
    { id: 'num', label: '数量', alignCenter: true },
    { id: 'identificationCode', label: '识别码', alignCenter: true },
    { id: 'applyState', label: '状态', alignCenter: true },
    { id: 'applyDate', label: '预约日期', alignCenter: true },
    { id: '', label: '操作', alignCenter: true },
];

export default function AppointmentInformation() {
    const ref = useRef();
    const { themeStretch } = useSettings();
    const theme = useTheme();
    const dispatch = useDispatch();

    const [appointmentList, setAppointmentList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [filterValue, setFilterValue] = useState({
        "applyDate": "",
        "applyNo": "",
        "partNumber": "",
        "trackingNumber": ""
    });
    const [visible, setVisible] = useState(false);
    const [total, setTotal] = useState(0);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [operationValue, setOperationValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [isDistributionPositionVisible, setIsDistributionPositionVisible] = useState(false);
    const [verifyCodeCount, setVerifyCodeCount] = useState(0);
    const [statusForm, setStatusForm] = useState({
        applyNo: '',
        trackingNumber: '',
        applyState: '',
        id: '',
        desc: '',
    });
    const [distributionPositionForm, setDistributionPositionForm] = useState({});
    const [privateValue, setPrivateValue] = useState('');
    const [commonValue, setCommonValue] = useState('');
    const [isFilterValueChange, setIsFilterValueChange] = useState(false);
    useEffect(() => {
        getList();
    }, [rowsPerPage, isFilterValueChange]);

    const getList = async (pageValue = 1) => {
        setIsLoading(true)
        try {
            const params = {
                ...filterValue,
            };
            const { page } = await api.fetchAppointmentOrderList(params, pageValue, rowsPerPage);
            setTotal(page.totalCount);
            setAppointmentList(page.list);
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
            "applyDate": null,
            "applyNo": "",
            "partNumber": "",
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

    // 打开变更弹窗
    const onTypeChange = (row = {}) => {
        setStatusForm({ ...row });
        setDialogVisible(true);
    };

    // 关闭变更弹窗
    const onTypeChangeDialogClose = () => {
        setDialogVisible(false);
    }


    // 打开入仓弹窗
    const onDistributionPosition = (row = {}, isEnterOpen = false) => {
        // setDistributionPositionForm(row);
        setIsDistributionPositionVisible(true);
        fetchShelvesNo(row, isEnterOpen);
        setTimeout(() => JsBarcode("#barcode", row.applyNo), 1200);
    };

    const fetchShelvesNo = async (row, isEnterOpen) => {
        setIsLoading(true);
        try {
            const { list } = await api.fetchShelvesNo(row.trackingNumber);
            if (isEnterOpen) {
                setDistributionPositionForm({...list[0], privateAddress: row.privateAddress});
            } else {
                setDistributionPositionForm(list[0]);
            }
        } catch (e) {
            console.log(e);
            dispatch(
                setGlobalMessage({
                    variant: 'error',
                    msg: '获取分配货架号失败！',
                })
            );
        }
        setIsLoading(false);
    }

    // 关闭入仓弹窗
    const onDistributionPositionClose = () => {
        setIsDistributionPositionVisible(false);
    }

    const typeChange = async () => {
        setIsButtonLoading(true);
        let result = {};
        try {
            result = await api.statusTypeChange({ trackingNumber: statusForm.trackingNumber, desc: statusForm.desc, applyState: statusForm.applyState });
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

    const distributionPosition = async () => {
        setIsButtonLoading(true);
        let result = {};
        try {
            result = await api.distributionPosition(
                [
                    {
                        "applyId": distributionPositionForm.applyId,
                        "private_": distributionPositionForm.privateAddress,
                        "shelvesDetailId": distributionPositionForm.shelvesDetailId,
                        "version": distributionPositionForm.version
                    }
                ]
            );
            if (result.msg === 'success') {
                getList();
                dispatch(
                    setGlobalMessage({
                        variant: 'success',
                        msg: '入仓成功！',
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
                msg: result.msg || '入仓失败！',
            })
        );
        setIsButtonLoading(false);
    }

    const tryOpendistributionPosition = async (event, type, value) => {
        if (event.keyCode === 13) {
            setIsLoading(true)
            try {
                const { page } = await api.fetchAppointmentOrderList({ trackingNumber: value }, 1, 5);
                if (page.totalCount > 0) {
                    const data = type === 'private' ? { ...page.list[0], privateAddress: 'YES' } : { ...page.list[0], privateAddress: 'NO' };
                    onDistributionPosition(data, true);
                    return;
                }
            } catch (e) {
                console.log(e);
            }
            setIsLoading(false);
            dispatch(
                setGlobalMessage({
                    variant: 'error',
                    msg: '没有搜索到运单号！',
                })
            );
        }
    }

    return (
        <Page title="预约信息">
            <Container maxWidth={themeStretch ? false : 'lg'} sx={{ position: 'relative' }}>
                <HeaderBreadcrumbs
                    heading="预约信息"
                    links={[
                        { name: '预约信息' },
                        { name: '预约申报' },
                    ]}
                />
                <Card>
                    <Stack spacing={2}
                        sx={{ py: 2.5, px: 3, display: 'flex', flexFlow: 'wrap', alignItems: 'center', justifyContent: 'flex-start', maxWidth: '100%' }}>
                        <InputStyle
                            label='预约单号'
                            size='small'
                            stretchStart={240}
                            sx={{ marginTop: '16px', marginRight: '15px !important' }}
                            value={filterValue.applyNo}
                            onChange={(event) => handleFilter('applyNo', event.target.value)}
                            placeholder="请输入预约单号"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />

                                ),
                            }}
                        />
                        <InputStyle
                            sx={{ marginRight: '15px !important' }}
                            size='small'
                            label='运单号'
                            stretchStart={240}
                            value={filterValue.trackingNumber}
                            onChange={(event) => handleFilter('trackingNumber', event.target.value)}
                            placeholder="请输入快递单号"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <InputStyle
                            sx={{ marginRight: '15px !important' }}
                            size='small'
                            label='货号'
                            stretchStart={240}
                            value={filterValue.partNumber}
                            onChange={(event) => handleFilter('partNumber', event.target.value)}
                            placeholder="请输入货号"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <DatePicker
                            class="DatePicker"
                            label="申报日期"
                            inputFormat="yyyy-MM-dd"
                            value={filterValue.applyDate}
                            onChange={(newValue) => handleFilter('applyDate', formatDate(newValue))}
                            renderInput={(params) => <CssTextField placeholder="请选择申报日期" sx={{ marginRight: '15px !important', width: '240px' }} size='small' {...params} />}
                        />
                        <InputStyle
                            sx={{ marginRight: '15px !important' }}
                            size='small'
                            label='私人扫码'
                            stretchStart={240}
                            value={privateValue}
                            onChange={(event) => setPrivateValue(event.target.value)}
                            placeholder="私人扫码入仓"
                            onKeyDown={(event) => tryOpendistributionPosition(event, 'private', privateValue)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <InputStyle
                            sx={{ marginRight: '15px !important' }}
                            size='small'
                            label='普通扫码'
                            stretchStart={240}
                            value={commonValue}
                            onChange={(event) => setCommonValue(event.target.value)}
                            placeholder="普通扫码入仓"
                            onKeyDown={(event) => tryOpendistributionPosition(event, 'common', commonValue)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <Button onClick={debounce(onSearch, 300)} sx={{ marginRight: '15px !important', width: 104, maxHeight: 40 }} variant="outlined">
                            查询
                        </Button>

                        <Button onClick={debounce(onReset, 300)} sx={{ marginRight: '15px !important', maxHeight: 40 }} variant="outlined">
                            重置
                        </Button>

                    </Stack>
                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 1800 }}>
                            <Table>
                                <ProductListHead
                                    needCheckBox='false'
                                    headLabel={TABLE_HEAD}
                                    rowCount={appointmentList.length}
                                    numSelected={selected.length}
                                />
                                <TableBody sx={{ px: 2 }}>
                                    {appointmentList.map((row, index) => {
                                        return (
                                            <TableRow hover key={index} tabIndex={-1} >
                                                {/* <TableCell style={{ minWidth: 100 }}>{row.id}</TableCell> */}
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.applyNo}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.trackingNumber}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.expressCompanyEnum}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.logisticsStatusEnum}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120, display:'flex', justifyContent:"center" }}>
                                                    <img alt="" src={row.img} style={{maxWidth:'55px'}}/>
                                                
                                                </TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.partNumber}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.size}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.num}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.identificationCode}</TableCell>
                                                <TableCell align="center">
                                                    <Label
                                                        variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                        color={row.applyState === 'SUCCESS' ? 'success' : 'error'}
                                                    >
                                                        {row.applyState === 'SUCCESS' ? '预约成功' : '问题包裹'}
                                                    </Label>
                                                </TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{fDateTime(row.applyDate)}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 140 }} >
                                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                                                        <Typography onClick={() => onTypeChange(row)} color={theme.palette.info.main} variant="body1" style={{ cursor: 'pointer' }}>
                                                            变更
                                                        </Typography>
                                                        <Typography onClick={() => onDistributionPosition(row)} color={theme.palette.info.main} variant="body1" style={{ cursor: 'pointer' }}>
                                                            入仓
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
                {/* 变更类型 */}
                <Dialog sx={{ mx: 'auto' }} scroll="paper" maxWidth={'800px'} open={dialogVisible}>
                    <DialogTitle id="scroll-dialog-title">
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                            <Typography variant="h6"> 变更类型 </Typography>
                            <Iconify onClick={onTypeChangeDialogClose} icon={'eva:close-fill'} color={theme.palette.grey[800]} />
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, width: '720px' }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <Box sx={{ width: '50%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>预约单号：</span><span>{statusForm.applyNo}</span>
                            </Box>
                            <Box sx={{ width: '50%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>运单号：</span><span>{statusForm.trackingNumber}</span>
                            </Box>
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3, width: '100%' }}
                        >
                            <InputStyle
                                label="当前状态"
                                select
                                style={{ width: '100%' }}
                                placeholder="请选择状态"
                                value={statusForm.applyState}
                                onChange={(e) => setStatusForm({ ...statusForm, applyState: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            >
                                <MenuItem value='ERROR'>问题包裹</MenuItem>
                                <MenuItem value='SUCCESS'>预约成功</MenuItem>

                            </InputStyle>
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <InputStyle
                                label="内容"
                                style={{ width: '100%' }}
                                placeholder="请输入内容"
                                value={statusForm.payPassword}
                                onChange={(e) => setStatusForm({ ...statusForm, desc: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                        </Stack>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={onTypeChangeDialogClose} variant="outlined">
                            取消
                        </Button>
                        <LoadingButton
                            onClick={typeChange}
                            loading={isButtonLoading}
                            variant="contained"
                        >确认</LoadingButton>
                    </DialogActions>
                </Dialog>

                {/* 入仓 */}
                <Dialog sx={{ mx: 'auto' }} scroll="paper" maxWidth={'900px'} open={isDistributionPositionVisible}>
                    <DialogTitle id="scroll-dialog-title">
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                            <Typography variant="h6"> 入仓 </Typography>
                            <Iconify onClick={onDistributionPositionClose} icon={'eva:close-fill'} color={theme.palette.grey[800]} />
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, width: '850px' }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <Box sx={{ width: '40%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>预约单号：</span><span>{distributionPositionForm.applyNo}</span>
                            </Box>
                            <Box sx={{ width: '40%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>运单号[收]：</span><span>{distributionPositionForm.trackingNumber}</span>
                            </Box>
                            <Box sx={{ width: '20%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>货号：</span><span>{distributionPositionForm.partNumber}</span>
                            </Box>
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <Box sx={{ width: '40%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>尺码：</span><span>{distributionPositionForm.size}</span>
                            </Box>
                            <Box sx={{ width: '40%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>分配货架：</span><span>{distributionPositionForm.shelvesNo}</span>
                            </Box>
                            <Box sx={{ width: '20%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>识别码：</span><span>{distributionPositionForm.identificationCode}</span>
                            </Box>
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <span style={{ color: '#637381', fontSize: '14px' }}>是否私人地址：</span>
                            <RadioGroup
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                                onChange={(e) => setDistributionPositionForm({ ...distributionPositionForm, privateAddress: e.target.value })}
                                defaultValue="YES"
                                value={distributionPositionForm.privateAddress}
                                sx={{ marginLeft: '10px' }}
                            >
                                <FormControlLabel value="YES" control={<Radio />} label="是" />
                                <FormControlLabel value="NO" control={<Radio />} label="否" />
                            </RadioGroup>
                        </Stack>

                    </DialogContent>
                    <Box sx={{ display: 'none' }}>
                        <Box ref={ref}>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-start"
                                sx={{ py: 2, px: 3 }}
                            >
                                <Box sx={{ width: '50%' }}>
                                    <span style={{ color: '#637381', fontSize: '14px' }}>预约单号：</span><span>{distributionPositionForm.applyNo}</span>
                                </Box>

                                <Box sx={{ width: '50%' }}>
                                    <span style={{ color: '#637381', fontSize: '14px' }}>货号：</span><span>{distributionPositionForm.partNumber}</span>
                                </Box>
                            </Stack>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-start"
                                sx={{ py: 2, px: 3 }}
                            >
                                <Box sx={{ width: '50%' }}>
                                    <span style={{ color: '#637381', fontSize: '14px' }}>分配货架：</span><span>{distributionPositionForm.partNumber}</span>
                                </Box>

                                <Box sx={{ width: '50%' }}>
                                    <span style={{ color: '#637381', fontSize: '14px' }}>识别码：</span><span>{distributionPositionForm.identificationCode}</span>
                                </Box>
                            </Stack>
                            <Stack>
                                <canvas id="barcode" />
                            </Stack>
                        </Box>
                    </Box>
                    <Divider />
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={onDistributionPositionClose} variant="outlined">
                            取消
                        </Button>
                        <Button onClick={() => onTypeChange(distributionPositionForm)} variant="contained">
                            变更类型
                        </Button>

                        <Button variant="contained">
                            <ReactToPrint
                                trigger={() => <a style={{ textDecoration: 'none', color: '#fff' }}>打印条形码</a>}
                                content={() => ref.current}
                            />
                        </Button>
                        <LoadingButton onClick={distributionPosition} loading={isButtonLoading} variant="contained">确认入仓</LoadingButton>
                    </DialogActions>
                </Dialog>
               
            </Container >
            {isLoading && <Loading />}
        </Page >
    );
}
