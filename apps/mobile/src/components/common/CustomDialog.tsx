import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';

export type DialogOption = {
  text: string;
  onPress: () => void;
  isCancel?: boolean;
  isDanger?: boolean;
};

export type CustomDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  loading?: boolean;
  hideCancel?: boolean;
  options?: DialogOption[];
};

export default function CustomDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  loading = false,
  hideCancel = false,
  options,
}: CustomDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onCancel} disabled={loading}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.dialog}>
              <Text style={styles.title}>{title}</Text>
              {message && <Text style={styles.message}>{message}</Text>}
              
              {options ? (
                <View style={styles.optionsList}>
                  {options.map((opt, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[
                        styles.optionBtn,
                        opt.isCancel && styles.optionBtnCancel,
                        opt.isDanger && styles.optionBtnDanger,
                      ]}
                      onPress={opt.onPress}
                      disabled={loading}
                    >
                      <Text
                        style={[
                          styles.optionBtnText,
                          opt.isCancel && styles.optionBtnTextCancel,
                          opt.isDanger && styles.optionBtnTextDanger,
                        ]}
                      >
                        {opt.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.btnRow}>
                  {!hideCancel && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={onCancel}
                      disabled={loading}
                    >
                      <Text style={styles.cancelBtnText}>{cancelText}</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.confirmBtn, isDanger && styles.confirmBtnDanger]}
                    onPress={onConfirm}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.confirmBtnText,
                        isDanger && styles.confirmBtnTextDanger,
                      ]}
                    >
                      {loading ? 'Processing...' : confirmText}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    width: '100%',
    backgroundColor: '#2C2C2C',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  confirmBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#C6FF34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDanger: {
    backgroundColor: '#EF4444',
  },
  confirmBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#2C2C2C',
  },
  confirmBtnTextDanger: {
    color: '#FFFFFF',
  },
  optionsList: {
    width: '100%',
    gap: 8,
  },
  optionBtn: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    backgroundColor: '#C6FF34',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBtnCancel: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  optionBtnDanger: {
    backgroundColor: '#EF4444',
  },
  optionBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#2C2C2C',
  },
  optionBtnTextCancel: {
    color: '#FFFFFF',
  },
  optionBtnTextDanger: {
    color: '#FFFFFF',
  },
});
