import { sentenceCase } from 'change-case';
import { useState, useEffect, React } from 'react';
import { debounce } from 'lodash';
// @mui
import { useTheme, styled } from '@mui/material/styles';
import {
    Stack, Card, Table, TableRow, Checkbox, TableBody, TableCell,
    Container, Typography, TableContainer, TablePagination, Dialog,
    DialogTitle, DialogContent, DialogContentText, Button, DialogActions,
    InputAdornment, Box, MenuItem, Divider, Radio, RadioGroup, FormControlLabel,
    Tab, Tabs, Avatar, TextField, Chip
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
import OrderDetail from './orderDetail';

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

export default function OrderManage() {
    const { themeStretch } = useSettings();
    const theme = useTheme();
    const dispatch = useDispatch();

    const [orderList, setOrderList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [filterValue, setFilterValue] = useState({
        createTime: '',
        identificationCode: '',
        state: null,
        stockOutNo: '',
        trackingNumber: ''
    });
    const [visible, setVisible] = useState(false);
    const [total, setTotal] = useState(0);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [isDetailDialogVisible, setIsDetailDialogVisible] = useState(false);

    const [ticketType, setTicketType] = useState('1');
    const [tableHead, setTableHead] = useState([]);
    const [currentRow, setCurrentRow] = useState({});
    const [stockOutNo, setStockOutNo] = useState('');
    const [isFilterValueChange, setIsFilterValueChange] = useState(false);
    const [amountStatistical, setAmountStatistical] = useState({
        countDomestic: '0',
        countForward: '0',
        countLift: '0',
        countSell: '0'
    });
    const fetchTableHead = () => {
        switch (ticketType) {
            case '1':
                setTableHead([
                    { id: 'id', label: 'ID', alignCenter: true },
                    { id: 'stockOutNo', label: '出库单号', alignCenter: true },
                    { id: 'num', label: '数量', alignCenter: true },
                    { id: 'identificationCode', label: '识别码', alignCenter: true },
                    { id: 'createTime', label: '订单创建日期', alignCenter: true },
                    { id: 'state', label: '状态', alignCenter: true },
                    { id: '', label: '操作', alignCenter: true },
                ]);
                break;
            case '2':
                setTableHead([
                    { id: 'id', label: 'ID', alignCenter: true },
                    { id: 'stockOutNo', label: '出库单号', alignCenter: true },
                    { id: 'num', label: '数量', alignCenter: true },
                    { id: 'identificationCode', label: '识别码', alignCenter: true },
                    { id: 'createTime', label: '订单创建日期', alignCenter: true },
                    { id: 'state', label: '状态', alignCenter: true },
                    { id: '', label: '操作', alignCenter: true },
                ]);
                break;
            case '3':
                setTableHead([
                    { id: 'id', label: 'ID', alignCenter: true },
                    { id: 'stockOutNo', label: '出库单号', alignCenter: true },
                    { id: 'num', label: '数量', alignCenter: true },
                    { id: 'pickUpCode', label: '提货码', alignCenter: true },
                    { id: 'createTime', label: '订单创建日期', alignCenter: true },
                    { id: 'state', label: '状态', alignCenter: true },
                    { id: '', label: '操作', alignCenter: true },
                ]);
                break;
            case '4':
                setTableHead([
                    { id: 'id', label: 'ID', alignCenter: true },
                    { id: 'stockOutNo', label: '出库单号', alignCenter: true },
                    { id: 'num', label: '数量', alignCenter: true },
                    { id: 'identificationCode', label: '识别码', alignCenter: true },
                    { id: 'createTime', label: '订单创建日期', alignCenter: true },
                    { id: 'address', label: '收货地址', alignCenter: true },
                    { id: 'trackingNumber', label: '运单号', alignCenter: true },
                    { id: 'weight', label: '重量', alignCenter: true },
                    { id: 'transportCost', label: '订单金额', alignCenter: true },
                    { id: 'state', label: '状态', alignCenter: true },
                    { id: '', label: '操作', alignCenter: true },
                ]);
                break;
            default: setTicketType('1');
        }
    }

    useEffect(() => {
        fetchTableHead();
    }, [ticketType]);

    useEffect(() => {
        fetchOrderAmountStatistical();
    }, []);

    useEffect(() => {
        getList();
    }, [rowsPerPage, ticketType, isFilterValueChange]);
    const fetchOrderAmountStatistical = async () => {
        try {
            const result = await api.fetchOrderAmountStatistical();
            setAmountStatistical(result);
            console.log(result)
        } catch (e) {
            console.log(e);
        }

    }
    const getList = async (pageValue = 1) => {
        setIsLoading(true)
        try {
            const params = {
                ...filterValue,
            };
            let result = {};
            switch (ticketType) {
                case '1':
                    delete params.trackingNumber
                    result = await api.fetchOrderListBySell(params, pageValue, rowsPerPage);
                    break;
                case '2':
                    delete params.trackingNumber
                    result = await api.fetchOrderListByDomestic(params, pageValue, rowsPerPage);
                    break;
                case '3':
                    delete params.trackingNumber
                    result = await api.fetchOrderListByLift(params, pageValue, rowsPerPage);
                    break;
                case '4':
                    result = await api.fetchOrderListByForward(params, pageValue, rowsPerPage);
                    break;
                default: setTicketType('1');
            }
            setTotal(result.page.totalCount);
            setOrderList(result.page.list);
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
            identificationCode: '',
            state: null,
            stockOutNo: '',
            trackingNumber: '',
            createTime: null
        });
        setPage(0);
        setIsFilterValueChange(!isFilterValueChange);
    };

    // 每页显示条数切换
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    // 打开编辑用户弹窗
    const onConfirmOut = (row = {}) => {
        setCurrentRow(row)
        setDialogVisible(true);
    };

    // 关闭编辑用户弹窗
    const onDialogClose = () => {
        setCurrentRow({});
        setDialogVisible(false);
    }


    // 打开编辑余额弹窗
    const onDetail = (row = {}) => {
        setStockOutNo(row.stockOutNo);
        setIsDetailDialogVisible(true);
    };

    const onDetailDialogClose = () => {
        setIsDetailDialogVisible(false);
    }

    const orderConfirmOut = async () => {
        setIsButtonLoading(true);
        let result = {};
        try {
            result = await api.orderConfirmOut(currentRow?.stockOutNo);
            if (result.msg === 'success') {
                getList();
                dispatch(
                    setGlobalMessage({
                        variant: 'success',
                        msg: '操作成功！',
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
                msg: result.msg || '操作失败！',
            })
        );
        setIsButtonLoading(false);
    }

    const handleChange = (event, newValue) => {
        setTicketType(newValue);
        setFilterValue({ ...filterValue, ticketType: newValue });
    };

    return (
        <Page title="订单管理">
            <Container maxWidth={themeStretch ? false : 'lg'} sx={{ position: 'relative' }}>
                <HeaderBreadcrumbs
                    heading="订单信息"
                    links={[
                        { name: '订单信息' },
                        { name: '订单管理' },
                    ]}
                />
                <Card>
                    <Stack>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={ticketType} onChange={handleChange} sx={{ marginLeft: '10px' }}>
                                <Tab value={'1'} label={
                                    <div>
                                        <span style={{ paddingRight: '5px' }}>出售</span>
                                        <Label>{amountStatistical.countSell}</Label>
                                    </div>
                                }></Tab>
                                <Tab value={'2'} label={
                                    <div>
                                        <span style={{ paddingRight: '5px' }}>境内</span>
                                        <Label>{amountStatistical.countDomestic}</Label>
                                    </div>} />
                                <Tab value={'3'} label={
                                    <div>
                                        <span style={{ paddingRight: '5px' }}>自提</span>
                                        <Label>{amountStatistical.countLift}</Label>
                                    </div>} />
                                <Tab value={'4'} label={
                                    <div>
                                        <span style={{ paddingRight: '5px' }}>转寄</span>
                                        <Label>{amountStatistical.countForward}</Label>
                                    </div>} />
                            </Tabs>
                        </Box>
                    </Stack >

                    <Stack sx={{ py: 2.5, px: 3, display: 'flex', flexFlow: 'wrap', alignItems: 'center', justifyContent: 'flex-start', maxWidth: '100%' }}>
                        <InputStyle
                            label='出库单号'
                            size='small'
                            sx={{ marginTop: '16px', marginRight: '15px !important' }}
                            stretchStart={240}
                            value={filterValue.stockOutNo}
                            onChange={(event) => handleFilter('stockOutNo', event.target.value)}
                            placeholder="请输入出库单号"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <InputStyle
                            size='small'
                            label='识别码'
                            sx={{ marginTop: '16px', marginRight: '15px !important' }}
                            stretchStart={240}
                            value={filterValue.identificationCode}
                            onChange={(event) => handleFilter('identificationCode', event.target.value)}
                            placeholder="请输入识别码"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <InputStyle
                            stretchStart={240}
                            size='small'
                            sx={{ marginTop: '16px', marginRight: '15px !important' }}
                            select
                            label="状态"
                            placeholder="请选择状态"
                            value={filterValue.state}
                            onChange={(event, ref) => {
                                setFilterValue({ ...filterValue, state: event.target.value })
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        >
                            <MenuItem value='FINISH'>已完成</MenuItem>
                            {/* <MenuItem value='WAITING_PAY'>等待支付</MenuItem> */}
                            <MenuItem value='WAIT_WAREHOUSE_HANDLE'>等待仓库确认</MenuItem>
                        </InputStyle>
                        {ticketType === '4' &&
                            <InputStyle
                                size='small'
                                label='运单号'
                                sx={{ marginTop: '16px', marginRight: '15px !important' }}
                                stretchStart={240}
                                value={filterValue.trackingNumber}
                                onChange={(event) => handleFilter('trackingNumber', event.target.value)}
                                placeholder="请输入运单号"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                        }
                        <DatePicker
                            class="DatePicker"
                            label="订单日期"
                            inputFormat="yyyy-MM-dd"
                            value={filterValue.createTime}
                            onChange={(newValue) => handleFilter('createTime', formatDate(newValue))}
                            renderInput={(params) => <CssTextField placeholder="请选择订单日期" sx={{ marginTop: '16px', marginRight: '15px !important', width: '240px' }} size='small' {...params} />}
                        />
                        <Button onClick={debounce(onSearch, 300)} sx={{ width: 104, maxHeight: 40, marginTop: '16px', marginRight: '15px !important' }} variant="outlined">
                            查询
                        </Button>

                        <Button onClick={debounce(onReset, 300)} sx={{ maxHeight: 40, marginTop: '16px', marginRight: '15px !important' }} variant="outlined">
                            重置
                        </Button>
                    </Stack >
                    <Scrollbar>
                        <TableContainer sx={{ minWidth: ticketType === '4' ? 1800 : 1200 }}>
                            <Table>
                                <ProductListHead
                                    needCheckBox='false'
                                    headLabel={tableHead}
                                    rowCount={orderList.length}
                                    numSelected={selected.length}
                                // onSelectAllClick={handleSelectAllClick}
                                />
                                <TableBody sx={{ px: 2 }}>
                                    {orderList.map((row, index) => {
                                        return (
                                            <TableRow
                                                hover
                                                key={index}
                                                tabIndex={-1}
                                            >
                                                <TableCell align="center" style={{ minWidth: 80 }}>{row.id}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 200 }}>{row.stockOutNo}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 80 }}>{row.num}</TableCell>
                                                {ticketType !== '3' &&
                                                    <TableCell align="center" style={{ minWidth: 120 }}>{row.identificationCode}</TableCell>
                                                }
                                                {ticketType === '3' &&
                                                    <TableCell align="center" style={{ minWidth: 120 }}>{row.pickUpCode}</TableCell>
                                                }
                                                <TableCell align="center" style={{ minWidth: 150 }}>{fDateTime(row.createTime)}</TableCell>
                                                {ticketType === '4' && (
                                                    <>
                                                        <TableCell align="center" style={{ minWidth: 160 }}>{row.address}</TableCell>
                                                        <TableCell align="center" style={{ minWidth: 120 }}>{row.trackingNumber}</TableCell>
                                                        <TableCell align="center" style={{ minWidth: 100 }}>{row.weight}</TableCell>
                                                        <TableCell align="center" style={{ minWidth: 100 }}>{row.transportCost}</TableCell>
                                                    </>

                                                )}
                                                <TableCell align="center" style={{ minWidth: 140 }}>
                                                    {row.state === 'WAITING_PAY' &&
                                                        <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                            color={'info'}
                                                        >
                                                            等待支付
                                                        </Label>
                                                    }
                                                    {row.state === 'WAIT_WAREHOUSE_HANDLE' &&
                                                        <Label variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                            color={'warning'}
                                                        >
                                                            等待仓库确认
                                                        </Label>
                                                    }
                                                    {row.state === 'FINISH' &&
                                                        <Label
                                                            variant={theme.palette.mode === 'light' ? 'ghost' : 'filled'}
                                                            color={'success'}
                                                        >
                                                            已完结
                                                        </Label>
                                                    }
                                                </TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }} >
                                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                                                        <Typography onClick={() => onDetail(row)} color={theme.palette.info.main} variant="body1" style={{ cursor: 'pointer' }}>
                                                            {ticketType !== '4' ? '查看详情' : '订单详情'}
                                                        </Typography>
                                                        {
                                                            ticketType !== '4' && row.state !== 'FINISH' &&
                                                            <Typography onClick={() => onConfirmOut(row)} color={theme.palette.info.main} variant="body1" style={{ cursor: 'pointer' }}>
                                                                确认
                                                            </Typography>
                                                        }
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
                {/* 状态编辑 */}
                <Dialog sx={{ mx: 'auto' }} scroll="paper" maxWidth={'800px'} open={dialogVisible}>
                    <DialogTitle id="scroll-dialog-title">
                        提示：
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, width: '400px' }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 3, px: 5 }}
                        >
                            是否要确认出库？
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={onDialogClose} variant="outlined">
                            取消
                        </Button>
                        <LoadingButton
                            onClick={orderConfirmOut}
                            loading={isButtonLoading}
                            variant="contained"

                        >确认</LoadingButton>
                    </DialogActions>
                </Dialog>

                {/* 订单详情 */}
                {isDetailDialogVisible && <OrderDetail stockOutNo={stockOutNo} onClose={() => setIsDetailDialogVisible(false)} type={ticketType} />}

            </Container >
            {isLoading && <Loading />}
        </Page >
    );
}
