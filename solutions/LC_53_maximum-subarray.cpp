class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int n = nums.size();
        int ans = nums[0], cur = 0;
        for (int i = 0; i < n; i++) {
            cur += nums[i];
            if (cur > ans) ans = cur;
            if (cur < 0) cur = 0;
        }
        return ans;
    }
};
