import PropTypes from 'prop-types';
// form
import { FormProvider as Form } from 'react-hook-form';

// ----------------------------------------------------------------------

FormProvider.propTypes = {
  children: PropTypes.node.isRequired,
  methods: PropTypes.object.isRequired,
  onSubmit: PropTypes.func,
  formRef: PropTypes.any, // 为了外部触发自带的submit
};

export default function FormProvider({ children, onSubmit, methods, formRef }) {
  return (
    <Form {...methods}>
      <form ref={formRef} onSubmit={onSubmit}>{children}</form>
    </Form>
  );
}
