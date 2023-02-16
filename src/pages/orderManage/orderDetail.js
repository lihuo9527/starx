import { sentenceCase } from 'change-case';
import { useState, useEffect, React, useRef } from 'react';
import ReactToPrint from 'react-to-print';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
// @mui
import { useTheme } from '@mui/material/styles';
import {
    Stack, Card, Table, TableRow, Checkbox, TableBody, TableCell,
    Container, Typography, TableContainer, TablePagination, Dialog,
    DialogTitle, DialogContent, DialogContentText, Button, DialogActions,
    InputAdornment, Box, MenuItem, Divider, Radio, RadioGroup, FormControlLabel,
    Tab, Tabs, Avatar
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import LoadingButton from '@mui/lab/LoadingButton';
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

OrderDetail.propTypes = {
    onClose: PropTypes.func,
    stockOutNo: PropTypes.string,
    type: PropTypes.string,
};
export default function OrderDetail({ onClose, stockOutNo, type }) {
    const ref = useRef();
    const { themeStretch } = useSettings();
    const theme = useTheme();
    const dispatch = useDispatch();
    const [orderList, setOrderList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [tableHead, setTableHead] = useState([]);
    const [currentRow, setCurrentRow] = useState({});
    const [title, setTitle] = useState('');
    const visible = true;
    const [form, setForm] = useState({
        "trackingNumber": '',
        "pounds": '',
        "stockOutNo": stockOutNo,
        "transportPrice": '',
    });
    const fetchTableHead = () => {
        switch (type) {
            case '1':
                setTableHead([
                    { id: 'id', label: 'ID', alignCenter: true },
                    { id: 'applyNo', label: '预约单号', alignCenter: true },
                    { id: 'trackingNumber', label: '运单号[收]', alignCenter: true },
                    { id: 'img', label: '商品图片', alignCenter: true },
                    { id: 'shoeName', label: '商品名', alignCenter: true },
                    { id: 'partNumber', label: '货号', alignCenter: true },
                    { id: 'size', label: '尺码', alignCenter: true },
                    { id: 'num', label: '数量', alignCenter: true },
                    { id: 'identificationCode', label: '识别码', alignCenter: true },
                    { id: 'areaNo', label: '货架号', alignCenter: true },
                    { id: 'inInventoryTime', label: '入仓日期', alignCenter: true },
                    { id: 'createTime', label: '订单创建日期', alignCenter: true },
                    { id: 'labelUrl', label: 'Label', alignCenter: true },
                ]);
                setTitle('出售');
                break;
            case '2':
                setTableHead([
                    { id: 'id', label: 'ID', alignCenter: true },
                    { id: 'applyNo', label: '预约单号', alignCenter: true },
                    { id: 'trackingNumber', label: '运单号[收]', alignCenter: true },
                    { id: 'img', label: '商品图片', alignCenter: true },
                    { id: 'shoeName', label: '商品名', alignCenter: true },
                    { id: 'partNumber', label: '货号', alignCenter: true },
                    { id: 'size', label: '尺码', alignCenter: true },
                    { id: 'num', label: '数量', alignCenter: true },
                    { id: 'identificationCode', label: '识别码', alignCenter: true },
                    { id: 'areaNo', label: '货架号', alignCenter: true },
                    { id: 'inInventoryTime', label: '入仓日期', alignCenter: true },
                    { id: 'createTime', label: '订单创建日期', alignCenter: true },
                    { id: 'labelUrl', label: 'Label', alignCenter: true },
                ]);
                setTitle('境内');
                break;
            case '3':
                setTableHead([
                    { id: 'id', label: 'ID', alignCenter: true },
                    { id: 'applyNo', label: '预约单号', alignCenter: true },
                    { id: 'trackingNumber', label: '运单号[收]', alignCenter: true },
                    { id: 'img', label: '商品图片', alignCenter: true },
                    { id: 'shoeName', label: '商品名', alignCenter: true },
                    { id: 'partNumber', label: '货号', alignCenter: true },
                    { id: 'size', label: '尺码', alignCenter: true },
                    { id: 'num', label: '数量', alignCenter: true },
                    { id: 'areaNo', label: '货架号', alignCenter: true },
                    { id: 'inInventoryTime', label: '入仓日期', alignCenter: true },
                ]);
                setTitle('自提');
                break;
            case '4':
                setTableHead([
                    { id: 'id', label: 'ID', alignCenter: true },
                    { id: 'applyNo', label: '预约单号', alignCenter: true },
                    { id: 'trackingNumber', label: '运单号[收]', alignCenter: true },
                    { id: 'img', label: '商品图片', alignCenter: true },
                    { id: 'shoeName', label: '商品名', alignCenter: true },
                    { id: 'partNumber', label: '货号', alignCenter: true },
                    { id: 'size', label: '尺码', alignCenter: true },
                    { id: 'num', label: '数量', alignCenter: true },
                    { id: 'areaNo', label: '货架号', alignCenter: true },
                    { id: 'inInventoryTime', label: '入仓日期', alignCenter: true },
                ]);
                setTitle('转寄');
                break;
            default: break;
        }
    }

    useEffect(() => {
        fetchTableHead();
    }, []);

    useEffect(() => {
        getOrderList();
    }, [rowsPerPage]);

    const getOrderList = async (pageValue = 1) => {
        setIsLoading(true)
        try {
            let result = {};
            switch (type) {
                case '1':
                    result = await api.fetchOrderDetailBySell({ state: null, stockOutNo }, pageValue, rowsPerPage);
                    break;
                case '2':
                    result = await api.fetchOrderDetailByDomestic({ state: null, stockOutNo }, pageValue, rowsPerPage);
                    break;
                case '3':
                    result = await api.fetchOrderDetailByLift({ state: null, stockOutNo }, pageValue, rowsPerPage);
                    break;
                case '4':
                    result = await api.fetchOrderDetailByForward({ state: null, stockOutNo }, pageValue, rowsPerPage);
                    break;
                default: break;
            }
            setTotal(result.page.totalCount);
            setOrderList(result.page.list);
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false)
    };


    // 每页显示条数切换
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const onDialogClose = () => {
        onClose();
    }

    const onSubmit = async () => {
        setIsButtonLoading(true);
        let result = {};
        try {
            console.log(form)
            result = await api.expressInformationSubmit(form);
            if (result.msg === 'success') {
                getOrderList();
                dispatch(
                    setGlobalMessage({
                        variant: 'success',
                        msg: '操作成功！',
                    })
                );
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

    return (
        <Dialog sx={{ mx: 'auto' }} scroll="paper" maxWidth={'1880px'} open={visible}>
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3, width: type === '3' || type === '4' ? '1540px' : '1720px' }}>
                    <Typography variant="h6"> {title}详情 </Typography>
                    <Iconify onClick={onDialogClose} icon={'eva:close-fill'} color={theme.palette.grey[800]} />
                </Stack>
            </DialogTitle>
            <DialogContent sx={{ p: 0, width: type === '3' || type === '4' ? '1600px' : '1780px' }}>
                <Scrollbar>
                    <TableContainer ref={ref} sx={{ width: type === '3' || type === '4' ? '1600px' : '1780px', maxHeight: '800px' }}>
                        <Table>
                            <ProductListHead
                                needCheckBox='false'
                                headLabel={tableHead}
                                rowCount={orderList.length}
                                numSelected={selected.length}
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
                                            <TableCell align="center" style={{ minWidth: 200 }}>{row.applyNo}</TableCell>
                                            <TableCell align="center" style={{ minWidth: 160 }}>{row.trackingNumber}</TableCell>
                                            <TableCell align="center" style={{ minWidth: 120, display:'flex', justifyContent:'center' }}>
                                                <img alt="" src={row.img} style={{ maxWidth: '50px' }}/>
                                            </TableCell>
                                            <TableCell align="center" style={{ minWidth: 120, maxWidth: 200 }}>{row.shoeName}</TableCell>
                                            <TableCell align="center" style={{ minWidth: 100 }}>{row.partNumber}</TableCell>
                                            <TableCell align="center" style={{ minWidth: 100 }}>{row.size}</TableCell>
                                            <TableCell align="center" style={{ minWidth: 100 }}>{row.num}</TableCell>
                                            {
                                                type !== '3' && type !== '4' && <TableCell align="center" style={{ minWidth: 120 }}>{row.identificationCode}</TableCell>
                                            }
                                            <TableCell align="center" style={{ minWidth: 120 }}>{row.areaNo}</TableCell>
                                            <TableCell align="center" style={{ minWidth: 150 }}>{fDateTime(row.inInventoryTime)}</TableCell>
                                            {
                                                type !== '3' && type !== '4' && <TableCell align="center" style={{ minWidth: 150 }}>{fDateTime(row.createTime)}</TableCell>
                                            }
                                            {
                                                type !== '3' && type !== '4' && <TableCell align="center" style={{ minWidth: 80 }}>
                                                    <a rel="noreferrer" target="_blank" style={{textDecoration:'underline', cursor:'pointer' }} href={row.label}>label</a>
                                                </TableCell>
                                            }
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
                        getOrderList(value + 1);
                    }}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
                }
                {total > 0 &&
                    <Button startIcon={<PrintIcon />} variant="contained" style={{ position: 'absolute', bottom: '16px', left: '10px', zIndex: '2' }}>
                        <ReactToPrint
                            trigger={() => <a style={{ textDecoration: 'none', color: '#fff' }}>打印订单信息</a>}
                            content={() => ref.current}
                        />
                    </Button>
                }
                {isLoading && <Loading />}
            </DialogContent>
            <Divider />
            {
                type === '4' && <DialogActions sx={{ p: 3, display: 'flex', flexWrap: 'wrap' }}>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ pb: 3, width: '100%' }}>
                        <InputStyle
                            label='运单号'
                            size='small'
                            sx={{ marginTop: '16px', marginRight: '15px !important' }}
                            stretchStart={400}
                            value={form.trackingNumber}
                            onChange={(event) => setForm({ ...form, trackingNumber: event.target.value })}
                            placeholder="请输入运单号"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <InputStyle
                            size='small'
                            label='订单重量'
                            sx={{ marginTop: '16px', marginRight: '15px !important' }}
                            stretchStart={400}
                            value={form.pounds}
                            onChange={(event) => setForm({ ...form, pounds: event.target.value })}
                            placeholder="请输入订单重量"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <InputStyle
                            size='small'
                            label='订单金额'
                            sx={{ marginTop: '16px', marginRight: '15px !important' }}
                            stretchStart={400}
                            value={form.transportPrice}
                            onChange={(event) => setForm({ ...form, transportPrice: event.target.value })}
                            placeholder="请输入订单金额"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                    </Stack>
                    <Stack direction="row" alignItems="center" justifyContent="flex-end">
                        <Button sx={{ marginRight: '20px' }} onClick={onDialogClose} variant="outlined">
                            取消
                        </Button>
                        <LoadingButton
                            onClick={onSubmit}
                            loading={isButtonLoading}
                            variant="contained"

                        >提交</LoadingButton>
                    </Stack>
                </DialogActions>
            }
        </Dialog>
    );
}
