import { Modal } from "antd";

interface ModalProps {
    open: boolean;
    onOk: ()=>void;
}

export default function PaymentDetailsModal(props: ModalProps) {
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

            <ul role="list" className="detail-info">
                <li>
                    <span>Bank Name:</span>
                    Guarantee Trust Bank
                </li>
                <li>
                    <span>Account Number:</span>
                    <b>0520727602</b>
                </li>
                <li>
                    <span>Account Name:</span>
                    Johnson Peter A.
                </li>

                <li>
                    <span>Description:</span>
                    <i>Your consent token</i>
                </li>
            </ul>

            <p>
                please put your that token in the transaction description for quick confirmation.<br/>
                <br/>
                We will send you a confirmation mail as sson as we confirm your payment.
            </p>
            <br/>


        </Modal>
    )
}