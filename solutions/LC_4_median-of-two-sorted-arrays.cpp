class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        if (nums1.size() > nums2.size()) return findMedianSortedArrays(nums2, nums1);
        int m = nums1.size(), n = nums2.size();
        int l = 0, r = m;
        while (l <= r) {
            int i = (l + r) / 2;
            int j = (m + n + 1) / 2 - i;
            int mxL1 = (i == 0) ? INT_MIN : nums1[i - 1];
            int mnR1 = (i == m) ? INT_MAX : nums1[i];
            int mxL2 = (j == 0) ? INT_MIN : nums2[j - 1];
            int mnR2 = (j == n) ? INT_MAX : nums2[j];
            if (mxL1 <= mnR2 && mxL2 <= mnR1) {
                if ((m + n) % 2 != 0) return max(mxL1, mxL2);
                return (max(mxL1, mxL2) + min(mnR1, mnR2)) / 2.0;
            } else if (mxL1 > mnR2) {
                r = i - 1;
            } else {
                l = i + 1;
            }
        }
        return 0.0;
    }
};
