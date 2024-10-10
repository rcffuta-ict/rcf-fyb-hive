import { message, Modal, notification } from "antd";
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface ModalProps {
    open: boolean;
    onOk: ()=>void;
}

export default function PaymentDetailsModal(props: ModalProps) {
    const raw_amount = 6_000;
    const amount = `₦ ${raw_amount}`;
    return (
        <Modal
            title="Proceed with your payment"
            centered
            open={props.open}
            onOk={props.onOk}
            onCancel={() => props.onOk}
            closeIcon={null}
            okText={"Confirm"}
            cancelText={""}
        >
            <p>
                Please proceed with your payment to this account:
            </p>

            <br/>

            <CopyToClipboard text={raw_amount.toString()} onCopy={() => notification.success({
                message: (
                    <span>
                        Copied Amount to pay
                        <br/>

                        <span className="fs-32 fw-700">{amount}</span>
                    </span>
                )
            })}>
                <h3 className="fs-48 fw-700 text-center">
                    <span className="cursor-pointer">{amount}</span>
                </h3>
            </CopyToClipboard>
            {/* <br/> */}

            <ul role="list" className="detail-info">
                <li>
                    <span>Bank Name:</span>

                    <CopyToClipboard
                        text={"Guarantee Trust Bank"}
                        onCopy={() => notification.success({
                            message: (
                                <span>
                                    Copied Account Bank Name
                                    <br/>

                                    <span className="fs-18 fw-700">Guarantee Trust Bank</span>
                                </span>
                            )
                        })}
                    >
                        <span className="cursor-pointer">Guarantee Trust Bank</span>
                    </CopyToClipboard>
                </li>

                <li>
                    <span>Account Number:</span>
                    <CopyToClipboard
                        text={"0520727602"}
                        onCopy={() => notification.success({
                            message: (
                                <span>
                                    Copied Account number
                                    <br/>

                                    <span className="fs-32 fw-700">0520727602</span>
                                </span>
                            )
                        })}
                    >

                        <b className="cursor-pointer">0520727602</b>
                    </CopyToClipboard>
                </li>
                <li>
                    <span>Account Name:</span>

                    <CopyToClipboard
                        text={"Johnson Peter A."}
                        onCopy={() => notification.success({
                            message: (
                                <span>
                                    Copied Account Name
                                    <br/>

                                    <span className="fs-18 fw-700">Johnson Peter A.</span>
                                </span>
                            )
                        })}
                    >

                        <span className="cursor-pointer">Johnson Peter A.</span>
                    </CopyToClipboard>
                </li>

                <li>
                    <span>Description:</span>
                    <i>Your consent token</i>
                </li>
            </ul>

            <br/>

            <p>
                please put your <span className="text-uppercase fw-700">consent token</span> in the transaction description for quick confirmation.<br/>
                <br/>
                We will send you a confirmation mail as sson as we confirm your payment.
            </p>
            <br/>


        </Modal>
    )
}